import { prismaClient } from "../index.js";
import { HttpResponse } from "../utils/httpResponse.js";

export const getMenus = async (req, res) => {
  const menus = await prismaClient.menu.findMany();
  return HttpResponse.success("Menus retrived", menus).send(res);
};
