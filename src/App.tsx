import React from "react";
import Providers from "./views/Providers";
import EmailGateway from "./views/EmailGateway";

const App: React.FC = () => {
  return (
    <Providers>
      <EmailGateway />
    </Providers>
  );
};

export default App;
