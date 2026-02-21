describe("API Automation - Fake API Categories", () => {
  const baseUrl = "https://api.escuelajs.co/api/v1/categories";

  it("GET - All Categories", () => {
    cy.request("GET", baseUrl).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
    });
  });

  it("GET - Single Category by ID", () => {
    cy.request("GET", `${baseUrl}/1`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("id", 1);
    });
  });

  it("POST - Create New Category", () => {
    cy.request("POST", baseUrl, {
      name: "Automation Test Category",
      image: "https://placeimg.com/640/480/tech",
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property(
        "name",
        "Automation Test Category",
      );
    });
  });

  it("PUT - Update Category", () => {
    cy.request("PUT", `${baseUrl}/1`, {
      name: "Updated Category Name",
      image: "https://placeimg.com/640/480/nature",
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("name", "Updated Category Name");
    });
  });

  it("DELETE - Remove Category with ID = last element", () => {
    // Step 1: Ambil semua kategori
    cy.request("GET", baseUrl).then((response) => {
      expect(response.status).to.eq(200);

      // Ambil ID dari elemen terakhir array
      const categories = response.body;
      const lastCategory = categories[categories.length - 1];
      const targetId = lastCategory.id;

      // Step 2: DELETE kategori dengan ID terakhir
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/${targetId}`,
        failOnStatusCode: false, // supaya tidak fail kalau ID tidak ada
      }).then((deleteResponse) => {
        // Validasi: bisa 200 kalau berhasil, atau 404 kalau ID tidak ada
        expect([200, 404]).to.include(deleteResponse.status);
        cy.log(`Tried to delete category with ID: ${targetId}`);
      });
    });
  });
  it("Negative Test - GET Non-existent Category", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/9999`,
      failOnStatusCode: false,
    }).then((response) => {
      // API mengembalikan 400, bukan 404
      expect(response.status).to.eq(400);
      cy.log("API returned 400 for non-existent category ID");
    });
  });

  it("Negative Test - POST with Empty Body", () => {
    cy.request({
      method: "POST",
      url: baseUrl,
      body: {}, // body kosong
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(500); // API return 500
      cy.log("API returned 500 when body is completely empty");
    });
  });

  it("Negative Test - POST with Missing Required Field", () => {
    cy.request({
      method: "POST",
      url: baseUrl,
      body: {
        name: "Category Without Image",
        // field image hilang
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400); // API return 400
      cy.log("API returned 400 when required field is missing");
    });
  });

  it("Negative Test - PUT with Invalid ID", () => {
    cy.request({
      method: "PUT",
      url: `${baseUrl}/9999`,
      body: {
        name: "Invalid Update",
        image: "https://placeimg.com/640/480/any",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it("Negative Test - DELETE Non-existent Category", () => {
    cy.request({
      method: "DELETE",
      url: `${baseUrl}/9999`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });
});
