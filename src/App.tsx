import React from "react";
import Providers from "./components/Providers";
import EmailGateway from "./components/EmailGateway";

const App: React.FC = () => {
  return (
    <Providers>
      <EmailGateway />
    </Providers>
  );
};

export default App;
