"use client";
import { useState } from "react"

import Register from "@storefront/modules/account/components/register"
import Login from "@storefront/modules/account/components/login"

export let LOGIN_VIEW;

(function(LOGIN_VIEW) {
  LOGIN_VIEW["SIGN_IN"] = "sign-in";
  LOGIN_VIEW["REGISTER"] = "register";
})(LOGIN_VIEW || (LOGIN_VIEW = {}));

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="w-full flex justify-start px-8 py-8">
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} />
      ) : (
        <Register setCurrentView={setCurrentView} />
      )}
    </div>
  );
}

export default LoginTemplate
