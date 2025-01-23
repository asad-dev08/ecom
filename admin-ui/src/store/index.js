import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./theme/themeSlice";
import authReducer from "./auth/authSlice";
import loadingReducer from "./loader/loadingSlice";
import securityRuleReducer from "./security-rule/securityRuleSlice";
import securityGroupReducer from "./security-group/securityGroupSlice";
import companyReducer from "./company/companySlice";
import menuReducer from "./menu/menuSlice";
import projectReducer from "./project/projectSlice";
import categoryReducer from "./category/categorySlice";
import productReducer from "./product/productSlice";
import brandReducer from "./brand/brandSlice";
import sellerReducer from "./seller/sellerSlice";
import subcategoryReducer from "./subcategory/subcategorySlice";
import dashboardReducer from "./dashboard/dashboardSlice";
import bannerReducer from "./banner/bannerSlice";
import specialOfferReducer from "./special-offer/specialOfferSlice";
import pageReducer from "./page/pageSlice";

import logger from "redux-logger";

const middlewares = [];

// Add redux-logger only in development mode
if (process.env.NODE_ENV === "development") {
  middlewares.push(logger);
}

const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    loading: loadingReducer,
    securityRule: securityRuleReducer,
    securityGroup: securityGroupReducer,
    company: companyReducer,
    menu: menuReducer,
    project: projectReducer,
    category: categoryReducer,
    product: productReducer,
    brand: brandReducer,
    seller: sellerReducer,
    subcategory: subcategoryReducer,
    dashboard: dashboardReducer,
    banner: bannerReducer,
    specialOffer: specialOfferReducer,
    page: pageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middlewares),
});

export default store;
