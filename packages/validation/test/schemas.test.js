import assert from "node:assert/strict";
import test from "node:test";
import {
  companyRegistrationSchema,
  companyProfileUpdateSchema,
  cityNameSchema,
  personalInformationUpdateSchema,
  updateProfessionalProfileSchema,
  createAdminSchema,
  createJobSchema,
  isDateOnOrAfterToday,
  isValidDateOnly,
  updateJobStatusSchema,
  createSupportTicketSchema,
  educationSchema,
  certificateSchema,
  experienceSchema,
  projectSchema,
  loginSchema,
  sendMessageSchema,
  userRegistrationSchema,
} from "../dist/index.js";

test("Company registration requires a valid slug and profile updates may omit it", () => {
  const registration = {
    role: "company",
    companyName: "Acme Technology",
    slug: "acme-technology",
    email: "company@example.com",
    password: "12345678",
    phone: "1234567",
    country: "United States",
    countryCode: "US",
    state: "California",
    stateCode: "CA",
    city: "Los Angeles",
    cityGeonameId: 5368361,
    location: "Los Angeles, California, United States",
  };

  assert.equal(companyRegistrationSchema.safeParse(registration).success, true);
  assert.equal(
    companyRegistrationSchema.safeParse({
      ...registration,
      country: "Syria",
      countryCode: "SY",
      state: "",
      stateCode: "",
      city: " Aleppo ",
      cityGeonameId: 170063,
      location: "Aleppo, Syria",
    }).data.city,
    "Aleppo",
  );
  assert.equal(
    companyRegistrationSchema.safeParse({
      ...registration,
      city: "Aleppo\ninvalid",
    }).success,
    false,
  );
  assert.equal(
    companyRegistrationSchema.safeParse({ ...registration, location: "" })
      .success,
    false,
  );
  assert.equal(
    companyRegistrationSchema.safeParse({
      ...registration,
      location: undefined,
    }).success,
    false,
  );
  assert.equal(
    companyRegistrationSchema.safeParse({ ...registration, slug: undefined })
      .success,
    false,
  );
  assert.equal(
    companyRegistrationSchema.safeParse({ ...registration, slug: null })
      .success,
    false,
  );
  assert.equal(
    companyRegistrationSchema.safeParse({ ...registration, slug: "Acme Tech" })
      .success,
    false,
  );

  assert.equal(
    companyProfileUpdateSchema.safeParse({ companyName: "Acme Technology" })
      .success,
    true,
  );
  assert.equal(
    companyProfileUpdateSchema.safeParse({
      companyName: "Acme Technology",
      slug: null,
    }).success,
    false,
  );
  assert.equal(
    companyProfileUpdateSchema.safeParse({
      companyName: "Acme Technology",
      slug: "acme-tech",
    }).success,
    true,
  );
  assert.equal(
    companyProfileUpdateSchema.safeParse({
      companyName: "Acme Technology",
      country: "United States",
      countryCode: "US",
      state: "California",
      city: "Los Angeles",
      cityGeonameId: "5368361",
      location: "Los Angeles, California, United States",
    }).success,
    true,
  );
  assert.equal(
    companyProfileUpdateSchema.safeParse({
      companyName: "Acme Technology",
      country: "United States",
      countryCode: "US",
    }).success,
    false,
  );
  assert.equal(
    companyProfileUpdateSchema.safeParse({
      companyName: "Acme Technology",
      location: "",
      country: "",
      countryCode: "",
      state: "",
      stateCode: "",
      city: "",
      cityGeonameId: "",
    }).success,
    true,
  );
});

test("Company slugs are not checked for uniqueness", () => {
  const registration = {
    role: "company",
    companyName: "Acme Technology",
    slug: "acme-technology",
    email: "company@example.com",
    password: "12345678",
    phone: "1234567",
    country: "United States",
    countryCode: "US",
    state: "California",
    stateCode: "CA",
    city: "Los Angeles",
    cityGeonameId: 5368361,
    location: "Los Angeles, California, United States",
  };

  assert.equal(companyRegistrationSchema.safeParse(registration).success, true);
  assert.equal(
    companyRegistrationSchema.safeParse({
      ...registration,
      email: "another@example.com",
    }).success,
    true,
  );
  assert.equal(
    companyProfileUpdateSchema.safeParse({ companyName: "Acme Tech" }).success,
    true,
  );
});

test("createJobSchema accepts a valid serializable job input", () => {
  const result = createJobSchema.safeParse({
    title: "Senior Developer",
    description: "Build and maintain recruiting workflows.",
    employmentType: "FULL_TIME",
    salary: 1000,
    deadline: "2026-12-31",
    experienceRequired: 3,
    skills: ["TypeScript"],
    questions: [],
  });

  assert.equal(result.success, true);
});

test("job deadlines are valid date-only calendar days", () => {
  assert.equal(isValidDateOnly("2026-10-03"), true);
  assert.equal(isValidDateOnly("2026-02-30"), false);
  assert.equal(isValidDateOnly("2026-10-03T00:00:00.000Z"), false);
  assert.equal(
    isDateOnOrAfterToday("2026-10-03", new Date("2026-10-03T23:59:59.000Z")),
    true,
  );
  assert.equal(
    isDateOnOrAfterToday("2026-10-02", new Date("2026-10-03T00:00:00.000Z")),
    false,
  );
  assert.equal(
    updateJobStatusSchema.safeParse({
      status: "OPEN",
      deadline: "2026-10-15",
    }).success,
    true,
  );
  assert.equal(
    updateJobStatusSchema.safeParse({
      status: "OPEN",
      deadline: "2026-02-30",
    }).success,
    false,
  );
});

test("shared schemas reject invalid required fields", () => {
  assert.equal(
    loginSchema.safeParse({ email: "bad", password: "" }).success,
    false,
  );
  assert.equal(
    loginSchema.safeParse({ email: "user@example.com", password: "1234567" })
      .success,
    false,
  );
  assert.equal(
    loginSchema.safeParse({ email: "user@example.com", password: "12345678" })
      .success,
    true,
  );
  assert.equal(
    createSupportTicketSchema.safeParse({ subject: "", description: "" })
      .success,
    false,
  );
  assert.equal(sendMessageSchema.safeParse({ content: " " }).success, false);
  assert.equal(
    companyRegistrationSchema.safeParse({ role: "company", email: "bad" })
      .success,
    false,
  );
  assert.equal(
    userRegistrationSchema.safeParse({
      role: "user",
      firstName: "Ali",
      lastName: "Hassan",
      email: "ali@example.com",
      password: "12345678",
      phone: "1234567",
      cityGeonameId: 5368361,
      country: "Saudi Arabia",
    }).success,
    false,
  );
  assert.equal(createAdminSchema.safeParse({}).success, false);
});

test("user registration requires country and city and accepts an optional region", () => {
  const registration = {
    role: "user",
    firstName: "Ali",
    lastName: "Hassan",
    email: "ali@example.com",
    password: "12345678",
    phone: "1234567",
    country: "United States",
    countryCode: "US",
    state: "California",
    stateCode: "CA",
    city: "Los Angeles",
    cityGeonameId: 5368361,
    birthdate: "1995-01-01",
  };

  assert.equal(userRegistrationSchema.safeParse(registration).success, true);
  assert.equal(
    userRegistrationSchema.safeParse({ ...registration, city: "" }).success,
    false,
  );
  assert.equal(
    userRegistrationSchema.safeParse({ ...registration, city: " Aleppo " }).data
      .city,
    "Aleppo",
  );
  assert.equal(
    userRegistrationSchema.safeParse({
      ...registration,
      city: "A".repeat(101),
    }).success,
    false,
  );
  assert.equal(
    userRegistrationSchema.safeParse({
      ...registration,
      city: "Aleppo\ninvalid",
    }).success,
    false,
  );
  assert.equal(
    userRegistrationSchema.safeParse({ ...registration, state: undefined })
      .success,
    true,
  );
});

test("city names accept international punctuation without allowing control characters", () => {
  assert.equal(cityNameSchema.safeParse("‘Alāqahdārī Aṯghar").success, true);
  assert.equal(cityNameSchema.safeParse("’s-Hertogenbosch").success, true);
  assert.equal(cityNameSchema.safeParse("Aït-Ben-Haddou").success, true);
  assert.equal(cityNameSchema.safeParse("Aleppo\ninvalid").success, false);
  assert.equal(cityNameSchema.safeParse("!!!").success, false);
});

test("personal information updates require valid contact, birthdate, and selected location", () => {
  const personalInformation = {
    phone: "1234567890",
    birthdate: "1995-01-01",
    country: "Afghanistan",
    countryCode: "AF",
    state: "Zabul",
    stateCode: "",
    city: "‘Alāqahdārī Aṯghar",
    cityGeonameId: "1148114",
  };

  assert.equal(
    personalInformationUpdateSchema.safeParse(personalInformation).success,
    true,
  );
  assert.equal(
    personalInformationUpdateSchema.safeParse({
      ...personalInformation,
      birthdate: "1995-02-30",
    }).success,
    false,
  );
  assert.equal(
    personalInformationUpdateSchema.safeParse({
      ...personalInformation,
      cityGeonameId: "",
    }).success,
    false,
  );
  assert.equal(updateProfessionalProfileSchema.safeParse({}).success, false);
});

test("profile schemas enforce canonical shape and date ordering", () => {
  assert.equal(
    educationSchema.safeParse({
      university: "A",
      degree: "CS",
      major: "AI",
      startDate: "2024-01-01",
      endDate: "2023-01-01",
    }).success,
    false,
  );
  assert.equal(
    educationSchema.safeParse({
      university: "University",
      degree: "Computer Science",
      major: "AI",
      startDate: "2024-01-01",
      endDate: null,
    }).success,
    true,
  );
  assert.equal(
    certificateSchema.safeParse({ certificateName: "A", organization: "Org" })
      .success,
    false,
  );
  assert.equal(
    projectSchema.safeParse({ title: "Project", description: "A project" })
      .success,
    true,
  );
  assert.equal(
    experienceSchema.safeParse({
      companyName: "Company",
      position: "Engineer",
      startDate: "2024-01-01",
    }).success,
    true,
  );
});
