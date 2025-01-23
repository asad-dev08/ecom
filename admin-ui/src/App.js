import React, { useEffect } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import "./App.css";
import AppRoutes from "./routes/appRoutes";
import ThemeProvider from "./contexts/ThemeContext";
import { LoaderWrapper } from "./components/loader/LoaderWrapper";
import { AuthProvider } from "./components/Auth/AuthContext";
import { Toaster } from "react-hot-toast";
import TokenExpirationChecker from "./components/Auth/TokenExpirationChecker";
import { useDispatch } from "react-redux";
import { fetchUserSettings } from "./store/theme/themeSlice";

const AuthProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  return <AuthProvider navigate={navigate}>{children}</AuthProvider>;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserSettings());
  }, [dispatch]);

  return (
    <ThemeProvider>
      <LoaderWrapper>
        <BrowserRouter>
          <TokenExpirationChecker>
            <AuthProviderWithNavigate>
              <AppRoutes />
            </AuthProviderWithNavigate>
          </TokenExpirationChecker>
        </BrowserRouter>
      </LoaderWrapper>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
