class LoginPage {
  visit() {
    cy.visit(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
    );
  }

  usernameField() {
    return cy.get('input[name="username"]', { timeout: 10000 });
  }

  passwordField() {
    return cy.get('input[name="password"]', { timeout: 10000 });
  }

  loginButton() {
    return cy.get('button[type="submit"]', { timeout: 10000 });
  }

  alertMessage() {
    return cy.get(".oxd-alert-content-text");
  }

  userDropdown() {
    return cy.get(".oxd-userdropdown-name");
  }

  logoutLink() {
    return cy.contains("Logout");
  }

  // Actions
  login(username, password) {
    this.usernameField().should("be.visible").type(username);
    this.passwordField().should("be.visible").type(password);
    this.loginButton().click();
  }
}

export default new LoginPage();
