import React from "react";
import Providers from "./components/Providers";
import EmailBuddy from "./email-buddy/EmailBuddy";

const App: React.FC = () => {
  return (
    <Providers>
      <EmailBuddy />
    </Providers>
  );
};

export default App;
