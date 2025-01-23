import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";

export const getPages = async (req, res) => {
  const pages = await prismaClient.page.findMany({
    where: {
      company_id: req.user.is_admin ? {} : req.user.company_id,
    },
    include: {
      sections: {
        orderBy: {
          sequence_no: "asc",
        },
      },
    },
  });

  return HttpResponse.success("Pages fetched successfully", pages).send(res);
};

export const getPage = async (req, res) => {
  const { id } = req.params;
  const page = await prismaClient.page.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: {
          sequence_no: "asc",
        },
      },
    },
  });

  if (!page) {
    return HttpResponse.notFound("Page not found").send(res);
  }

  return HttpResponse.success("Page fetched successfully", page).send(res);
};

export const createPage = async (req, res) => {
  try {
    const { id, sections, ...pageData } = req.body;

    const result = await prismaClient.$transaction(async (tx) => {
      const page = await tx.page.create({
        data: {
          ...pageData,
          created_by: req.user.id,
          created_ip: req.ip,
          company_id: req.user.company_id,
          sections: {
            create:
              sections?.map((section, index) => ({
                ...section,
                sequence_no: index,
                created_by: req.user.id,
                created_ip: req.ip,
                company_id: req.user.company_id,
              })) || [],
          },
        },
        include: {
          sections: true,
        },
      });

      await auditLog("pages", page.id, "CREATE", null, page, req.user.id, req);

      return page;
    });

    return HttpResponse.created("Page created successfully", result).send(res);
  } catch (error) {
    console.error("Create page error:", error);
    return HttpResponse.internalError(
      "Failed to create page",
      error.message
    ).send(res);
  }
};

export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { sections, ...pageData } = req.body;

    const result = await prismaClient.$transaction(async (tx) => {
      const existingPage = await tx.page.findUnique({
        where: { id },
        include: { sections: true },
      });

      if (!existingPage) {
        throw new Error(`Page not found with ID: ${id}`);
      }

      await tx.pageSection.deleteMany({
        where: { page_id: id },
      });

      const updatedPage = await tx.page.update({
        where: { id },
        data: {
          ...pageData,
          updated_by: req.user.id,
          updated_ip: req.ip,
          sections: {
            create: sections.map((section, index) => ({
              title: section.title,
              content: section.content,
              sequence_no: section.sequence_no || index,
              is_active: section.is_active ?? true,
              created_by: req.user.id,
              created_ip: req.ip,
              company_id: req.user.company_id,
            })),
          },
        },
        include: {
          sections: true,
        },
      });

      await auditLog(
        "pages",
        id,
        "UPDATE",
        existingPage,
        updatedPage,
        req.user.id,
        req
      );

      return updatedPage;
    });

    return HttpResponse.success("Page updated successfully", result).send(res);
  } catch (error) {
    console.error("Update page error:", error);
    if (error.message.includes("Page not found")) {
      return HttpResponse.notFound(error.message).send(res);
    }
    return HttpResponse.internalError(
      "Failed to update page",
      error.message
    ).send(res);
  }
};

export const deletePage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prismaClient.$transaction(async (tx) => {
      const page = await tx.page.findUnique({
        where: { id },
        include: { sections: true },
      });

      if (!page) {
        throw new Error("Page not found");
      }

      // Delete all sections first
      await tx.pageSection.deleteMany({
        where: { page_id: id },
      });

      // Then delete the page
      await tx.page.delete({
        where: { id },
      });

      await auditLog("pages", id, "DELETE", page, null, req.user.id, req);
      return page;
    });

    return HttpResponse.success("Page deleted successfully").send(res);
  } catch (error) {
    if (error.message === "Page not found") {
      return HttpResponse.notFound("Page not found").send(res);
    }
    return HttpResponse.internalError(
      "Failed to delete page",
      error.message
    ).send(res);
  }
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "page",
    ...req.body,
    include: {
      sections: {
        orderBy: {
          sequence_no: "asc",
        },
      },
    },
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};

// Page Section Controllers
export const getPageSections = async (req, res) => {
  const { pageId } = req.params;
  const sections = await prismaClient.pageSection.findMany({
    where: {
      page_id: pageId,
      company_id: req.user.company_id,
    },
    orderBy: {
      sequence_no: "asc",
    },
  });

  return HttpResponse.success("Sections fetched successfully", sections).send(
    res
  );
};

export const createPageSection = async (req, res) => {
  const { pageId } = req.params;
  const sectionData = req.body;

  try {
    const section = await prismaClient.pageSection.create({
      data: {
        ...sectionData,
        page_id: pageId,
        created_by: req.user.id,
        created_ip: req.ip,
        company_id: req.user.company_id,
      },
    });

    return HttpResponse.created("Section created successfully", section).send(
      res
    );
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to create section",
      error.message
    ).send(res);
  }
};

export const updatePageSection = async (req, res) => {
  const { pageId, sectionId } = req.params;
  const sectionData = req.body;

  try {
    const section = await prismaClient.pageSection.update({
      where: {
        id: sectionId,
        page_id: pageId,
      },
      data: {
        ...sectionData,
        updated_by: req.user.id,
        updated_ip: req.ip,
      },
    });

    return HttpResponse.success("Section updated successfully", section).send(
      res
    );
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to update section",
      error.message
    ).send(res);
  }
};

export const deletePageSection = async (req, res) => {
  const { pageId, sectionId } = req.params;

  try {
    await prismaClient.pageSection.delete({
      where: {
        id: sectionId,
        page_id: pageId,
      },
    });

    return HttpResponse.success("Section deleted successfully").send(res);
  } catch (error) {
    return HttpResponse.internalError(
      "Failed to delete section",
      error.message
    ).send(res);
  }
};
