import LoginPage from "../support/pageObjects/LoginPage";

Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("OrangeHRM Login Feature with Intercept (POM)", () => {
  beforeEach(() => {
    LoginPage.visit();
    cy.wait(2000);
  });

  it("TC01 - Login valid + intercept dashboard messages", () => {
    cy.intercept("GET", "/web/index.php/core/i18n/messages").as("messages");
    LoginPage.login("Admin", "admin123");
    cy.wait("@messages")
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);
    cy.url().should("include", "/dashboard");
  });

  it("TC02 - Username salah + intercept auth validate", () => {
    cy.intercept("POST", "/web/index.php/auth/validate").as("auth");
    LoginPage.login("Admin123", "admin123");
    cy.wait("@auth").its("response.statusCode").should("be.oneOf", [200, 302]);
    LoginPage.alertMessage().should("contain", "Invalid credentials");
  });

  it("TC03 - Password salah + intercept login page reload", () => {
    cy.intercept("GET", "/web/index.php/auth/login").as("loginPage");
    LoginPage.login("Admin", "wrongpass");
    cy.wait("@loginPage")
      .its("response.statusCode")
      .should("be.oneOf", [200, 500]);
    LoginPage.alertMessage().should("contain", "Invalid credentials");
  });

  it("TC04 - SQL Injection + intercept auth validate", () => {
    cy.intercept("POST", "/web/index.php/auth/validate").as("authFail");
    LoginPage.login("Admin' OR '1'='1", "anything");
    cy.wait("@authFail")
      .its("response.statusCode")
      .should("be.oneOf", [200, 302]);
    LoginPage.alertMessage().should("contain", "Invalid credentials");
  });

  it("TC05 - Case sensitivity + intercept JS bundle", () => {
    cy.intercept("GET", "/web/index.php/core/i18n/messages").as("i18n");
    LoginPage.login("admin", "ADMIN123");
    cy.wait("@i18n").its("response.statusCode").should("be.oneOf", [200, 304]);
    LoginPage.alertMessage().should("contain", "Invalid credentials");
  });

  it("TC06 - Logout setelah login + intercept dashboard API", () => {
    cy.intercept("GET", "**/api/v2/dashboard/**").as("dashboard");
    LoginPage.login("Admin", "admin123");
    cy.wait("@dashboard").its("response.statusCode").should("eq", 200);

    LoginPage.userDropdown().click();
    LoginPage.logoutLink().click();
    cy.url().should("include", "/auth/login");
  });
});
