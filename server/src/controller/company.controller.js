import { prismaClient } from "../index.js";
import { auditLog } from "../utils/audit.js";
import { HttpResponse } from "../utils/httpResponse.js";
import { getPaginatedData } from "../utils/pagination.js";

export const getCompanies = async (req, res) => {
  const companies = await prismaClient.company.findMany();
  return HttpResponse.success("Companies fetched successfully", companies).send(
    res
  );
};
export const getCompany = async (req, res) => {
  const company = await prismaClient.company.findFirst({
    where: { id: req.params.id },
  });
  return HttpResponse.success("Company fetched successfully", company).send(
    res
  );
};
export const deleteCompany = async (req, res) => {
  const loggedUser = req.user;
  const company = await prismaClient.company.delete({
    where: { id: req.params.id },
  });
  await auditLog(
    "companies",
    req.params.id,
    "DELETE",
    null,
    company,
    loggedUser.id,
    req
  );
  return HttpResponse.success("Company deleted successfully", company).send(
    res
  );
};
export const createCompany = async (req, res) => {
  const {
    company_name,
    company_short_name,
    company_code,
    registration_number,
    tax_id,
    address,
    city,
    state,
    country,
    postal_code,
    phone,
    email,
    website,
    industry,
    number_of_employees,
    annual_revenue,
    description,
    is_seller = false,
    is_active = false,
    seller_id,
  } = req.body;
  const loggedUser = req.user;

  const company = await prismaClient.company.create({
    data: {
      company_name,
      company_short_name,
      company_code,
      registration_number,
      tax_id,
      address,
      city,
      state,
      country,
      postal_code,
      phone,
      email,
      website,
      industry,
      number_of_employees,
      annual_revenue,
      description,
      is_active: is_active || false,
      is_seller,
      seller_id,
      created_by: loggedUser.id,
      created_at: new Date(),
      created_ip: req.ip,
    },
  });
  await auditLog(
    "companies",
    company.id,
    "CREATE",
    null,
    company,
    loggedUser.id,
    req
  );
  return HttpResponse.created("Company created successfully", company).send(
    res
  );
};

export const updateCompany = async (req, res) => {
  const {
    company_name,
    company_short_name,
    company_code,
    registration_number,
    tax_id,
    address,
    city,
    state,
    country,
    postal_code,
    phone,
    email,
    website,
    industry,
    number_of_employees,
    annual_revenue,
    description,
    is_active,
    is_seller,
    seller_id,
  } = req.body;

  const { id } = req.params;
  const loggedUser = req.user;
  const existingCompany = await prismaClient.company.findFirst({
    where: { id },
  });
  const company = await prismaClient.company.update({
    where: { id },
    data: {
      company_name,
      company_short_name,
      company_code,
      registration_number,
      tax_id,
      address,
      city,
      state,
      country,
      postal_code,
      phone,
      email,
      website,
      industry,
      number_of_employees,
      annual_revenue,
      description,
      is_active,
      is_seller,
      seller_id,
    },
  });

  await auditLog(
    "companies",
    id,
    "UPDATE",
    existingCompany,
    company,
    loggedUser.id,
    req
  );
  return HttpResponse.success("Company updated successfully", company).send(
    res
  );
};

export const paginatedData = async (req, res) => {
  const data = await getPaginatedData({
    model: "company",
    ...req.body,
  });
  return HttpResponse.success("Data fetched successfully", data).send(res);
};
