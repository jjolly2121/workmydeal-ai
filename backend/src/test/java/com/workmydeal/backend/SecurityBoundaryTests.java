package com.workmydeal.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:workmydeal-security-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "workmydeal.demo.enabled=true",
        "workmydeal.demo.reset-on-start=true"
})
@AutoConfigureMockMvc
class SecurityBoundaryTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void loginResponseDoesNotExposePassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin@test.com","password":"test123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.token").isString());
    }

    @Test
    void representativeCannotModifyUsersOrReadAuditHistory() throws Exception {
        String token = login("rep1@test.com");

        mockMvc.perform(post("/api/users")
                        .header("X-Auth-Token", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Unauthorized User",
                                  "email":"blocked@test.com",
                                  "password":"temporary-password",
                                  "role":"REP"
                                }
                                """))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/audit-history")
                        .header("X-Auth-Token", token))
                .andExpect(status().isForbidden());
    }

    @Test
    void administratorCanCreateUserWithoutReturningPassword() throws Exception {
        String token = login("admin@test.com");

        mockMvc.perform(post("/api/users")
                        .header("X-Auth-Token", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Portfolio Test User",
                                  "email":"portfolio-test@test.com",
                                  "password":"temporary-password",
                                  "role":"REP"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("portfolio-test@test.com"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void validationUsesTheSessionHeader() throws Exception {
        String token = login("manager@test.com");

        mockMvc.perform(get("/api/auth/validate")
                        .header("X-Auth-Token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true));

        mockMvc.perform(get("/api/auth/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
    }

    private String login(String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"test123"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        return json.get("token").asText();
    }
}
