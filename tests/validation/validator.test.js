import { describe, it, expect, vi } from "vitest";
import {emailValidator, displayNameValidator, passwordValidator} from "../../src/validation/validator.js";
import { getUserByEmail, getUserByDisplayName } from "../../src/services/user_service.js";

// Mock the getUserByEmail function
vi.mock("../../src/services/user_service.js", () => ({
  getUserByEmail: vi.fn(),
  getUserByDisplayName: vi.fn(),
}));

const testEmails = {
  valid: [
    "email@example.com",
    "firstname.lastname@example.com",
    "email@subdomain.example.com",
    "firstname+lastname@example.com",
    "\"email\"@example.com",
    "1234567890@example.com",
    "email@example-one.com",
    "_______@example.com",
    "email@example.name",
    "email@example.museum",
    "email@example.co.jp",
    "firstname-lastname@example.com",
    "simple@example.com",
    "very.common@example.com",
    "disposable.style.email.with+symbol@example.com",
    "other.email-with-hyphen@example.com",
    "fully-qualified-domain@example.com",
    "user.name+tag+sorting@example.com",
    "x@example.com",
    "example-indeed@strange-example.com",
    "example@s.example",
    "mailhost!username@example.org",
    "user%example.com@example.org",
    "user-@example.org",
    "user@sub.example.com",
    "user@sub.sub.example.com",
    "user@sub-domain.example.com",
    "あいうえお@example.com",
    "email@example.web"
  ],
  invalid: [
    "plainaddress",
    "#@%^%#$@#$@#.com",
    "@example.com",
    "Joe Smith <email@example.com>",
    "email.example.com",
    "email@example@example.com",
    ".email@example.com",
    "email.@example.com",
    "email..email@example.com",
    "email@example.com (Joe Smith)",
    "email@example",
    "email@-example.com",
    "email@111.222.333.44444",
    "email@example..com",
    "Abc..123@example.com",
    "plainaddress",
    "@missingusername.com",
    "username@.com",
    "username@.com.",
    "username@com",
    "username@-example.com",
    "username@example..com",
    "username@.example.com",
    "username@.example.com.",
    "username@.example..com",
    "username@.example-.com",
    "username@.example-.com.",
    "username@.example-.com..",
    "username@.example-.com...",
    "username@.example-.com....",
    "username@.example-.com.....",
    "username@.example-.com......",
    "username@.example-.com.......",
    "username@.example-.com........",
    "username@.example-.com.........",
    "username@.example-.com..........",
    "username@.example-.com...........",
    "username@.example-.com............",
    "username@.example-.com.............",
    "username@.example-.com.............."
  ]
};

const testDisplayNames = {
  valid: [
    "validname",
    "valid_name",
    "valid-name",
    "ValidName123",
    "validname123",
    "validname_123",
    "valid-name-123",
    "Valid_Name-123",
    "VALIDNAME",
    "validnamevalidnamevalidna", // exactly 25 characters
    "abcde", // min valid length
    "A123",
    "user_001",
    "test-case",
    "USERNAME_2025",
    "john_doe",
    "hello123",
    "coding_guy",
    "my-nickname",
    "validValid_valid"
  ],
  invalid: [
    "a", // too short
    "ab", // too short
    "abc", // too short
    "abcd@", // contains invalid character
    "ab cd", // contains space
    "longlonglonglonglonglonglonglonglonglong", // too long
    "name!", // contains invalid character
    "user#", // contains invalid character
    "name with space", // contains space
    "special&char", // contains invalid character
    "invalid$name", // contains invalid character
    "invalid%name", // contains invalid character
    "invalid^name", // contains invalid character
    "invalid*name", // contains invalid character
    "invalid(name)", // contains invalid character
    "invalid+name", // contains invalid character
    "invalid=name", // contains invalid character
    "invalid{name}", // contains invalid character
    "invalid[name]", // contains invalid character
    "invalid|name", // contains invalid character
    "invalid\\name", // contains invalid character
    "invalid/name", // contains invalid character
    "invalid?name", // contains invalid character
    "invalid<name>", // contains invalid character
    "invalid,name", // contains invalid character
    "invalid.name", // contains invalid character
    "invalid;name", // contains invalid character
    "invalid:name", // contains invalid character
    "invalid"name", // contains invalid character
    "invalid\"name", // contains invalid character
    "invalid!name", // contains invalid character
    "invalid~name", // contains invalid character
    "invalid`name", // contains invalid character
    "invalidnameinvalidnameinvalidnameinvalidname", // 36 characters (too long)
    "n@me123",
    "valid_name&",
    "space test",
    "two  spaces",
    "super-long-username-thatiswaytoolong",
    "______",
    "------",
    "---___",
    "_-_---_"
  ]
};

const testPasswords = {
  valid: [
    "Xj@9!qTp2Z&MwN7",
    "L8#Yz@P1XmQ^TWr",
    "G7p!XqT@Z9&Y2mN",
    "R1ZpT9@XqY4&NmW",
    "B@YzX9P1!QmTWr6",
    "M@XqZ9p1!TY4&Nr",
    "W7pX@YqZ9!Tm1&N",
    "Tq9!Xp@Z1Y&Wr7N",
    "YpXqT@9!Z1Wm&7N",
    "N@XpZ9!qY1TWr6m",
    "A!B2c3D4e5F6g7H8i9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6!",
  ],
  invalid: [
    "aB3!", // too short
    "123Aa!", // too short
    "Xy9!1d", // too short
    "VeryLongPasswordWithLotsOfCharacters!123456789012345678901234567890", // too long
    "PASSWORD123!", // missing lowercase letter
    "HELLO_123$", // missing lowercase letter
    "password123!", // missing uppercase letter
    "secure@key9", // missing uppercase letter
    "SecurePass!", // missing number
    "P@ssword_Lock", // missing number
    "Password123", // missing special character
    "SecureKey99", // missing special character
    "ToughPass98", // missing special character
  ]
};

const passwordsContainingEmail = [
  "emailer@emailer.com123!B", // Email at the start
  "GGGGGGG123emailer@emailer.com!", // Email in the middle
  "SuperSecure698emailer@emailer.com!", // Embedded email
  "emailer@emailer.com_SecureP@ss1", // Email with special characters
  "P@sswordemailer@emailer.com123", // Email at the end
  "EMAILER@EMAILER.COM!554b", // Uppercase email
  "Emailer@Emailer.Com2024$", // Mixed case email
  "Secure-emailer@emailer.com-123!", // With hyphen before email
  "126emailer@emailer.comP@ssword!", // Email followed by password-like structure
  "mypass_emailer@emailer.com_999!A" // Email embedded in a pattern
];

const passwordsContainingDisplayName = [
  "sunrise123!A",
  "B123sunrise!",
  "9SuperSecureSunrise!",
  "sunrise_SecureP@ss1$$$",
  "P@sswordSunrise123",
  "SUNRISE2024!o",
  "SunRise_987$",
  "secuRe-sunrise-999!",
  "@#myPass_sunrise_999",
  "SunriseP@ssword334!"
];

describe("emailValidator", () => {
  console.log("######### EMAIL TEST START ########");
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  // Test valid emails
  testEmails.valid.forEach(email => {
    it(`should return valid: true for a valid email: ${email}`, async () => {
      const result = await emailValidator(email);
      expect(result).toEqual({ valid: true });
    });
  });

  // Test invalid emails
  testEmails.invalid.forEach(email => {
    it(`should return valid: false and error for an invalid email: ${email}`, async () => {
      const result = await emailValidator(email);
      expect(result).toEqual({ valid: false, error: "Invalid email address" });
    });
  });

  // Test existing email
  it("should return valid: false and error for an existing email", async () => {
    getUserByEmail.mockResolvedValueOnce({ id: 1, email: "test@example.com" });
    const result = await emailValidator("test@example.com");
    expect(result).toEqual({ valid: false, error: "Email already in use" });
  });
  console.log("######### EMAIL TEST END ########");
});

describe("displayNameValidator", () => {
  console.log("######### DISPLAY NAME TEST START ########");
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  // Test valid display names.
  testDisplayNames.valid.forEach(displayName => {
    it(`should return valid: true for a valid display name: ${displayName}`, async () => {
      const result = await displayNameValidator(displayName);
      expect(result).toEqual({ valid: true });
    });
  });

  // Test invalid display names.
  testDisplayNames.invalid.forEach(displayName => {
    it(`should return valid: false and error for an invalid display name: ${displayName}`, async () => {
      const result = await displayNameValidator(displayName);
      expect(result).toEqual({ valid: false, error: expect.any(String) });
    });
  });

  // Test existing display name.
  it("should return valid: false and error for an existing display name", async () => {
    getUserByDisplayName.mockResolvedValueOnce({ id: 1, displayName: "testuser" });
    const result = await displayNameValidator("testuser");
    expect(result).toEqual({ valid: false, error: "Display name already in use" });
  });
  console.log("######### DISPLAY NAME TEST END ########");
});

describe("passwordValidator", () => {
  console.log("######### PASSWORD TEST START ########");

  // Test valid passwords.
  testPasswords.valid.forEach(password => {
    it(`should return valid: true for a valid password: ${password}`, async () => {
      const result = await passwordValidator(password, "test", "test");
      expect(result).toEqual({ valid: true });
    });
  });

  // Test invalid passwords.
  testPasswords.invalid.forEach(password => {
    it(`should return valid: false and error for an invalid password: ${password}`, async () => {
      const result = await passwordValidator(password, "test", "test");
      expect(result).toEqual({ valid: false, error: expect.any(String) });
    });
  });

  // Test password contains email.
  passwordsContainingEmail.forEach(password => {
    it(`should return valid: false and error for password: ${password} containing email: emailer@emailer.com`, async () => {
      const result = await passwordValidator(password, "emailer@emailer.com", "test");
      expect(result).toEqual({ valid: false, error: "Password should not contain your email or display name" });
    });
  });

  // Test password contains displayName.
  passwordsContainingDisplayName.forEach(password => {
    it(`should return valid: false and error for password: ${password} containing displayName: sunrise`, async () => {
      const result = await passwordValidator(password, "", "sunrise");
      expect(result).toEqual({ valid: false, error: "Password should not contain your email or display name" });
    });
  });
  console.log("######### PASSWORD TEST END ########");
});