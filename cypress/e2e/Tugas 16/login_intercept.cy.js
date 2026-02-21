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
    cy.get('input[name="username"]').type("Admin123");
    cy.get('input[name="password"]').type("admin123");
    cy.get('button[type="submit"]').clck();
    cy.wait("@messages")
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);

    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC03 - Password salah + intercept login page reload", () => {
    cy.intercept("GET", "/web/index.php/auth/login").as("loginPage");
    cy.get('input[name="username"]').type("Admin");
    cy.get('input[name="password"]').type("wrongpass");
    cy.get('button[type="submit"]').click();
    cy.wait("@loginPage").its("response.statusCode").should("eq", 200);
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC04 - Field kosong + intercept CSS request", () => {
    cy.intercept("GET", "/web/dist/css/*").as("css");
    cy.get("button[type='submit']").click();
    cy.wait("@css").its("response.statusCode").should("eq", 200);
    cy.get(".oxd-input-group__message").should("contain", "Required");
  });

  it("TC05 - Password kosong + intercept JS request", () => {
    cy.intercept("GET", "/web/dist/js/*").as("js");
    cy.get('input[name="username"]').type("Admin");
    cy.get("button[type='submit']").click();
    cy.wait("@js").its("response.statusCode").should("eq", 200);
    cy.get(".oxd-input-group__message").should("contain", "Required");
  });

  it("TC06 - Username kosong + intercept favicon", () => {
    cy.intercept("GET", "/favicon.ico").as("favicon");
    cy.get('input[name="password"]').type("admin123");
    cy.get("button[type='submit']").click();
    cy.wait("@favicon").its("response.statusCode").should("eq", 200);
    cy.get(".oxd-input-group__message").should("contain", "Required");
  });

  it("TC07 - Spasi di field + intercept branding image", () => {
    cy.intercept("GET", "/web/images/*").as("images");
    cy.get('input[name="username"]').type(" ");
    cy.get('input[name="password"]').type(" ");
    cy.get("button[type='submit']").click();
    cy.wait("@images").its("response.statusCode").should("eq", 200);
    cy.get(".oxd-input-group__message").should("contain", "Required");
  });

  it("TC08 - SQL Injection + intercept auth validate", () => {
    cy.intercept("POST", "/web/index.php/auth/validate").as("authFail");
    cy.get('input[name="username"]').type("Admin' OR '1'='1");
    cy.get('input[name="password"]').type("anything");
    cy.get('button[type="submit"]').click();
    cy.wait("@authFail").its("response.statusCode").should("eq", 200);
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC09 - Case sensitivity + intercept JS bundle", () => {
    cy.intercept("GET", "/web/dist/js/*").as("jsBundle");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("ADMIN123");
    cy.get('button[type="submit"]').click();
    cy.wait("@jsBundle").its("response.statusCode").should("eq", 200);
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC10 - Logout setelah login + intercept user dropdown", () => {
    cy.intercept("GET", "/web/index.php/dashboard").as("dashboard");
    cy.get('input[name="username"]').type("Admin");
    cy.get('input[name="password"]').type("admin123");
    cy.get('button[type="submit"]').click();
    cy.wait("@dashboard").its("response.statusCode").should("eq", 200);
    cy.get(".oxd-userdropdown-name").click();
    cy.contains("Logout").click();
    cy.url().should("include", "/auth/login");
  });
});
