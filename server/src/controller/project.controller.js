import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = "upload/projects";

const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  return `${baseName}_${timestamp}_${random}${extension}`;
};

export const getProjects = async (req, res) => {
  const projects = await prismaClient.project.findMany({
    include: {
      gallery: true,
      key_features: true,
      services: true,
      category: true,
    },
  });

  return HttpResponse.success("Projects fetched successfully", projects).send(
    res
  );
};

export const getProject = async (req, res) => {
  const { id } = req.params;
  const project = await prismaClient.project.findUnique({
    where: { id },
    include: {
      gallery: true,
      key_features: true,
      services: true,
      category: true,
    },
  });

  if (!project) {
    return HttpResponse.notFound("Project not found").send(res);
  }

  return HttpResponse.success("Project fetched successfully", project).send(
    res
  );
};

export const createProject = async (req, res) => {
  try {
    const projectData = JSON.parse(req.body.data);
    const { id, gallery, key_features, services, ...formattedData } =
      projectData;

    const result = await prismaClient.$transaction(async (tx) => {
      let thumbnailUrl = projectData.thumbnail_url || null;

      // Handle thumbnail upload only if new file is provided
      if (req.files?.thumbnail) {
        const thumbnail = req.files.thumbnail[0];
        const uniqueFileName = generateUniqueFileName(thumbnail.originalname);
        const thumbnailPath = path.join(
          process.cwd(),
          UPLOAD_DIR,
          uniqueFileName
        );

        await fs.mkdir(path.join(process.cwd(), UPLOAD_DIR), {
          recursive: true,
        });
        await fs.writeFile(thumbnailPath, thumbnail.buffer);
        thumbnailUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      // Handle gallery images
      const galleryCreate = [];
      if (projectData.gallery) {
        const newGalleryItems = projectData.gallery.filter(
          (item) => !item.isDeleted
        );

        for (let i = 0; i < newGalleryItems.length; i++) {
          const item = newGalleryItems[i];
          const file = req.files?.gallery?.[i];

          if (file) {
            const uniqueFileName = generateUniqueFileName(file.originalname);
            const filePath = path.join(
              process.cwd(),
              UPLOAD_DIR,
              uniqueFileName
            );
            await fs.writeFile(filePath, file.buffer);

            galleryCreate.push({
              image_url: `${UPLOAD_DIR}/${uniqueFileName}`,
              title: item.title,
              subtitle: item.subtitle,
              sequence_no: item.sequence_no,
              created_by: req.user.id,
              created_ip: req.ip,
              company_id: req.user.company_id,
            });
          }
        }
      }

      // Create key features data
      const keyFeaturesCreate = key_features?.map((item) => ({
        feature: item.feature,
        created_by: req.user.id,
        created_ip: req.ip,
        company_id: req.user.company_id,
      }));

      // Create services data
      const servicesCreate = services?.map((item) => ({
        service: item.service,
        created_by: req.user.id,
        created_ip: req.ip,
        company_id: req.user.company_id,
      }));

      const project = await tx.project.create({
        data: {
          ...formattedData,
          thumbnail_url: thumbnailUrl,
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
          gallery: {
            create: galleryCreate,
          },
          key_features: {
            create: keyFeaturesCreate,
          },
          services: {
            create: servicesCreate,
          },
        },
        include: {
          gallery: true,
          key_features: true,
          services: true,
          category: true,
        },
      });

      await auditLog(
        "projects",
        project.id,
        "CREATE",
        null,
        project,
        req.user.id,
        req
      );

      return project;
    });

    return HttpResponse.success("Project created successfully", result).send(
      res
    );
  } catch (error) {
    console.error("Create project error:", error);
    // Delete uploaded files if there's an error
    if (req.files) {
      await deleteUploadedFiles(req.files);
    }
    return HttpResponse.internalError(
      "Failed to create project",
      error.message
    ).send(res);
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = JSON.parse(req.body.data);

    const result = await prismaClient.$transaction(async (tx) => {
      const existingProject = await tx.project.findUnique({
        where: { id },
        include: {
          gallery: true,
          key_features: true,
          services: true,
        },
      });

      if (!existingProject) {
        throw new Error(`Project not found with ID: ${id}`);
      }

      let thumbnailUrl = existingProject.thumbnail_url;

      if (req.files?.thumbnail) {
        if (existingProject.thumbnail_url) {
          try {
            await fs.unlink(
              path.join(process.cwd(), existingProject.thumbnail_url)
            );
          } catch (error) {
            console.error("Error deleting old thumbnail:", error);
          }
        }

        const thumbnail = req.files.thumbnail[0];
        const uniqueFileName = generateUniqueFileName(thumbnail.originalname);
        const thumbnailPath = path.join(
          process.cwd(),
          UPLOAD_DIR,
          uniqueFileName
        );
        await fs.writeFile(thumbnailPath, thumbnail.buffer);
        thumbnailUrl = `${UPLOAD_DIR}/${uniqueFileName}`;
      }

      const { gallery, key_features, services, ...restData } = projectData;

      // Delete physical files for removed gallery images
      const deletedGalleryItems =
        projectData.gallery?.filter((item) => item.id && item.isDeleted) || [];

      for (const deletedItem of deletedGalleryItems) {
        const existingGalleryItem = existingProject.gallery.find(
          (g) => g.id === deletedItem.id
        );
        if (existingGalleryItem?.image_url) {
          try {
            await fs.unlink(
              path.join(process.cwd(), existingGalleryItem.image_url)
            );
          } catch (error) {
            console.error(
              `Error deleting gallery image: ${existingGalleryItem.image_url}`,
              error
            );
          }
        }
      }

      // Handle new gallery images
      const galleryCreate = [];
      const newGalleryItems =
        projectData.gallery?.filter((item) => !item.id && !item.isDeleted) ||
        [];

      // Process new gallery images
      for (let i = 0; i < newGalleryItems.length; i++) {
        const item = newGalleryItems[i];
        const file = req.files?.gallery?.[i];

        if (file) {
          const uniqueFileName = generateUniqueFileName(file.originalname);
          const filePath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);
          await fs.writeFile(filePath, file.buffer);

          galleryCreate.push({
            image_url: `${UPLOAD_DIR}/${uniqueFileName}`,
            title: item.title,
            subtitle: item.subtitle,
            sequence_no: item.sequence_no,
            created_by: req.user?.id,
            created_ip: req.ip,
            company_id: req.user?.company_id,
          });
        }
      }

      // Handle key features updates
      const keyFeaturesToDelete =
        key_features
          ?.filter((item) => item.id && item.isDeleted)
          ?.map((item) => item.id) || [];

      const keyFeaturesToUpdate =
        key_features
          ?.filter((item) => item.id && !item.isDeleted)
          ?.map((item) => ({
            where: { id: item.id },
            data: {
              feature: item.feature,
              updated_by: req.user?.id,
              updated_ip: req.ip,
            },
          })) || [];

      const keyFeaturesToCreate =
        key_features
          ?.filter((item) => !item.id && !item.isDeleted)
          ?.map((item) => ({
            feature: item.feature,
            created_by: req.user?.id,
            created_ip: req.ip,
            company_id: req.user?.company_id,
          })) || [];

      // Handle services updates
      const servicesToDelete =
        services
          ?.filter((item) => item.id && item.isDeleted)
          ?.map((item) => item.id) || [];

      const servicesToUpdate =
        services
          ?.filter((item) => item.id && !item.isDeleted)
          ?.map((item) => ({
            where: { id: item.id },
            data: {
              service: item.service,
              updated_by: req.user?.id,
              updated_ip: req.ip,
            },
          })) || [];

      const servicesToCreate =
        services
          ?.filter((item) => !item.id && !item.isDeleted)
          ?.map((item) => ({
            service: item.service,
            created_by: req.user?.id,
            created_ip: req.ip,
            company_id: req.user?.company_id,
          })) || [];

      const updatedProject = await tx.project.update({
        where: { id },
        data: {
          ...restData,
          thumbnail_url: thumbnailUrl,
          updated_by: req.user?.id,
          updated_ip: req.ip,
          gallery: {
            deleteMany: {
              id: {
                in: deletedGalleryItems.map((item) => item.id),
              },
            },
            create: galleryCreate,
            update:
              projectData.gallery
                ?.filter((item) => item.id && !item.isDeleted)
                ?.map((item) => ({
                  where: { id: item.id },
                  data: {
                    title: item.title,
                    subtitle: item.subtitle,
                    sequence_no: item.sequence_no,
                    updated_by: req.user?.id,
                    updated_ip: req.ip,
                  },
                })) || [],
          },
          key_features: {
            deleteMany: {
              id: {
                in: keyFeaturesToDelete,
              },
            },
            create: keyFeaturesToCreate,
            update: keyFeaturesToUpdate,
          },
          services: {
            deleteMany: {
              id: {
                in: servicesToDelete,
              },
            },
            create: servicesToCreate,
            update: servicesToUpdate,
          },
        },
        include: {
          gallery: true,
          key_features: true,
          services: true,
          category: true,
        },
      });

      return updatedProject;
    });

    return HttpResponse.success("Project updated successfully", result).send(
      res
    );
  } catch (error) {
    console.error("Update project error:", error);
    if (error.message.includes("Project not found")) {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update project",
      error.message
    ).send(res);
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id },
        include: {
          gallery: true,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      // Delete thumbnail
      if (project.thumbnail_url) {
        await fs.unlink(path.join(process.cwd(), project.thumbnail_url));
      }

      // Delete gallery images
      for (const gallery of project.gallery) {
        await fs.unlink(path.join(process.cwd(), gallery.image_url));
      }

      await tx.project.delete({
        where: { id },
      });

      await auditLog("projects", id, "DELETE", project, null, req.user.id, req);
      return project;
    });

    return HttpResponse.success("Project deleted successfully").send(res);
  } catch (error) {
    if (error.message === "Project not found") {
      return HttpResponse.notFound("Project not found").send(res);
    }
    return HttpResponse.internalError(
      "Failed to delete project",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "project",
    ...req.body,
    include: {
      gallery: true,
      key_features: true,
      services: true,
      category: true,
    },
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};

// Utility function to delete uploaded files
const deleteUploadedFiles = async (files) => {
  try {
    for (const fileType in files) {
      for (const file of files[fileType]) {
        if (file && file.originalname) {
          const uniqueFileName = generateUniqueFileName(file.originalname);
          const filePath = path.join(process.cwd(), UPLOAD_DIR, uniqueFileName);
          console.log("Deleting file:", filePath);

          try {
            await fs.unlink(filePath);
          } catch (unlinkError) {
            console.error(`Error deleting file ${filePath}:`, unlinkError);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in deleteUploadedFiles:", error);
  }
};
