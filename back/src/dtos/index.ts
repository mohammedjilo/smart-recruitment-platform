type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const toUserDto = (value: unknown) => {
  if (!isRecord(value)) return value;
  const { password: _password, ...user } = value;
  return user;
};

export const toCompanyDto = (value: unknown) => {
  if (!isRecord(value)) return value;
  const { password: _password, ...company } = value;
  return company;
};

export const toProfessionalProfileDto = (value: unknown) => {
  if (!isRecord(value)) return value;
  const profile = { ...value };
  if (isRecord(profile.user)) profile.user = toUserDto(profile.user);
  return profile;
};

export const toJobDto = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(toJobDto);
  if (!isRecord(value)) return value;
  const job = { ...value };
  if (job.company) job.company = toCompanyDto(job.company);
  return job;
};

export const toApplicationDto = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(toApplicationDto);
  if (!isRecord(value)) return value;
  const application = { ...value };
  if (application.user) application.user = toUserDto(application.user);
  if (application.job) application.job = toJobDto(application.job);
  return application;
};

export const toNotificationDto = (value: unknown): unknown => value;
export const toMessageDto = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(toMessageDto);
  if (!isRecord(value)) return value;
  const message = { ...value };
  if (message.sender) message.sender = toUserDto(message.sender);
  if (message.receiver) message.receiver = toUserDto(message.receiver);
  return message;
};

export const toResourceDto = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(toResourceDto);
  if (!isRecord(value)) return value;
  const resource = { ...value };
  if ("password" in resource) return toUserDto(resource);
  if (resource.user) resource.user = toUserDto(resource.user);
  if (resource.company) resource.company = toCompanyDto(resource.company);
  if (resource.job) resource.job = toJobDto(resource.job);
  if (resource.sender || resource.receiver) return toMessageDto(resource);
  return resource;
};
