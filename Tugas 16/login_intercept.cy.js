Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("OrangeHRM Login Feature with Intercept", () => {
  beforeEach(() => {
    cy.visit(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
    );
    cy.wait(2000);
  });

  it("TC01 - Login valid + intercept dashboard messages", () => {
    cy.intercept("GET", "/web/index.php/core/i18n/messages").as("messages");
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("Admin");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("admin123");
    cy.get('button[type="submit"]', { timeout: 10000 }).click();
    cy.wait("@messages")
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);
    cy.url().should("include", "/dashboard");
  });

  it("TC02 - Username salah + intercept auth validate", () => {
    cy.intercept("POST", "/web/index.php/auth/validate").as("auth");
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("Admin123");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("admin123");
    cy.get('button[type="submit"]', { timeout: 10000 }).click();
    cy.wait("@auth").its("response.statusCode").should("be.oneOf", [200, 302]);

    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC03 - Password salah + intercept login page reload", () => {
    cy.intercept("GET", "/web/index.php/auth/login").as("loginPage");
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("Admin");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("wrongpass");
    cy.get('button[type="submit"]').click();
    cy.wait("@loginPage").its("response.statusCode").should("eq", 200, 500);
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC04 - SQL Injection + intercept auth validate", () => {
    cy.intercept("POST", "/web/index.php/auth/validate").as("authFail");
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("Admin' OR '1'='1");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("anything");
    cy.get('button[type="submit"]', { timeout: 10000 }).click();
    cy.wait("@authFail")
      .its("response.statusCode")
      .should("be.oneOf", [200, 302]);
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC05 - Case sensitivity + intercept JS bundle", () => {
    // cy.intercept("GET", "**/web/dist/js/*").as("jsBundle");
    cy.intercept("GET", "/web/index.php/core/i18n/messages").as("i18n");
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("admin");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("ADMIN123");
    cy.get('button[type="submit"]', { timeout: 10000 }).click();
    cy.wait("@i18n", { timeout: 10000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC16 - Logout setelah login + intercept dashboard API", () => {
    cy.intercept("GET", "**/api/v2/dashboard/**").as("dashboard");
    cy.get('input[name="username"]').type("Admin");
    cy.get('input[name="password"]').type("admin123");
    cy.get('button[type="submit"]').click();

    cy.wait("@dashboard").its("response.statusCode").should("eq", 200);

    cy.get(".oxd-userdropdown-name").click();
    cy.contains("Logout").click();
    cy.url().should("include", "/auth/login");
  });
});
