export const getLoggedInFarmer = () => {
  const local = localStorage.getItem("loggedInFarmer");
  if (local) return JSON.parse(local);
  const session = sessionStorage.getItem("loggedInFarmer");
  if (session) return JSON.parse(session);
  return null;
};

export const loginFarmer = (farmer, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem("loggedInFarmer", JSON.stringify(farmer));
  } else {
    sessionStorage.setItem("loggedInFarmer", JSON.stringify(farmer));
  }
};

export const logoutFarmer = () => {
  localStorage.removeItem("loggedInFarmer");
  sessionStorage.removeItem("loggedInFarmer");
};

export const getLoggedInOfficer = () => {
  const local = localStorage.getItem("loggedInOfficer");
  if (local) return JSON.parse(local);
  const session = sessionStorage.getItem("loggedInOfficer");
  if (session) return JSON.parse(session);
  return null;
};

export const loginOfficer = (officer, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem("loggedInOfficer", JSON.stringify(officer));
  } else {
    sessionStorage.setItem("loggedInOfficer", JSON.stringify(officer));
  }
};

export const logoutOfficer = () => {
  localStorage.removeItem("loggedInOfficer");
  sessionStorage.removeItem("loggedInOfficer");
};

