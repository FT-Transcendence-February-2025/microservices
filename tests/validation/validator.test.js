import { describe, it, expect, vi } from 'vitest';
import { emailValidator, displayNameValidator } from '../../src/validation/validator.js';
import { getUserByEmail, getUserByDisplayName } from '../../src/services/user_service.js';

// Mock the getUserByEmail function
vi.mock('../../src/services/user_service.js', () => ({
  getUserByEmail: vi.fn(),
  getUserByDisplayName: vi.fn()
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
    "invalid'name", // contains invalid character
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

describe('emailValidator', () => {
  console.log('######### EMAIL TEST START ########');
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
      expect(result).toEqual({ valid: false, error: 'Invalid email address' });
    });
  });

  // Test existing email
  it('should return valid: false and error for an existing email', async () => {
    getUserByEmail.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });
    const result = await emailValidator('test@example.com');
    expect(result).toEqual({ valid: false, error: 'Email already in use' });
  });
  console.log('######### EMAIL TEST STOP ########');
});

describe('displayNameValidator', () => {
  console.log('######### DISPLAY NAME TEST START ########')
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
  });

  // Test valid display names
  testDisplayNames.valid.forEach(displayName => {
    it(`should return valid: true for a valid display name: ${displayName}`, async () => {
      const result = await displayNameValidator(displayName);
      expect(result).toEqual({ valid: true });
    });
  });

  // Test invalid display names
  testDisplayNames.invalid.forEach(displayName => {
    it(`should return valid: false and error for an invalid display name: ${displayName}`, async () => {
      const result = await displayNameValidator(displayName);
      expect(result).toEqual({ valid: false, error: expect.any(String) });
    });
  });

  // Test existing display name
  it('should return valid: false and error for an existing display name', async () => {
    getUserByDisplayName.mockResolvedValueOnce({ id: 1, displayName: 'testuser' });
    const result = await displayNameValidator('testuser');
    expect(result).toEqual({ valid: false, error: 'Display name already in use' });
  });
  console.log('######### DISPLAY NAME TEST STOP ########')
});