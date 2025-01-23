import { useSelector } from "react-redux";
import FullScreenLoader from "./FullScreenLoader";

export const LoaderWrapper = ({ children }) => {
  const isLoading = useSelector((state) => state.loading);

  return (
    <>
      {isLoading && <FullScreenLoader />}
      {children}
    </>
  );
};
