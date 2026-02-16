Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

describe("OrangeHRM Login Feature", () => {
  beforeEach(() => {
    cy.visit(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
    );
    cy.wait(2000);
  });

  it("TC01 - Login dengan kredensial valid", () => {
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("Admin");

    cy.get('input[name="password"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type("admin123");

    cy.get('button[type="submit"]', { timeout: 10000 }).click();

    cy.url().should("include", "/dashboard");
    cy.get("h6.oxd-topbar-header-breadcrumb-module", { timeout: 10000 }).should(
      "contain",
      "Dashboard",
    );
  });

  it("TC02 - Login dengan username salah", () => {
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("be.visible")
      .type("Admin123");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("be.visible")
      .type("admin123");
    cy.get('button[type="submit"]').click();
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC03 - Login dengan password salah", () => {
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("be.visible")
      .type("Admin");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("be.visible")
      .type("wrongpass");
    cy.get('button[type="submit"]').click();
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC04 - Login dengan field kosong", () => {
    cy.get("button[type='submit']", { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .click();
    cy.get(".oxd-input-group__message", { timeout: 10000 }).should(
      "contain",
      "Required",
    );
  });

  it("TC05 - Login dengan password kosong", () => {
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("be.visible")
      .type("Admin");
    cy.get('button[type="submit"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .click();
    cy.get(".oxd-input-group__message", { timeout: 10000 }).should(
      "contain",
      "Required",
    );
  });

  it("TC06 - Login dengan username kosong", () => {
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("be.visible")
      .type("admin123");
    cy.get('button[type="submit"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .click();
    cy.get(".oxd-input-group__message", { timeout: 10000 }).should(
      "contain",
      "Required",
    );
  });

  it("TC07 - Login dengan spasi di field", () => {
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type(" ");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .type(" ");
    cy.get("button[type='submit']", { timeout: 10000 })
      .should("exist")
      .and("be.visible")
      .click();
    cy.get(".oxd-input-group__message", { timeout: 10000 }).should(
      "contain",
      "Required",
    );
  });

  it("TC08 - Login dengan SQL Injection", () => {
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("be.visible")
      .type("Admin' OR '1'='1");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("be.visible")
      .type("anything");
    cy.get('button[type="submit"]').click();
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC09 - Login dengan case sensitivity", () => {
    //username: admin (huruf kecil)
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("be.visible")
      .type("admin");
    //password: ADMIN123 (huruf besar)
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("be.visible")
      .type("ADMIN123");
    cy.get('button[type="submit"]').click();
    cy.get(".oxd-alert-content-text").should("contain", "Invalid credentials");
  });

  it("TC010 - Logout setelah login berhasil", () => {
    cy.get('input[name="username"]', { timeout: 10000 })
      .should("be.visible")
      .type("Admin");
    cy.get('input[name="password"]', { timeout: 10000 })
      .should("be.visible")
      .type("admin123");
    cy.get('button[type="submit"]').click();
    cy.get(".oxd-userdropdown-name").click();
    cy.contains("Logout").click();
    cy.url().should("include", "/auth/login");
  });
});
