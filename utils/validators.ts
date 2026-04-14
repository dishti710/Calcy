export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Basic validation - at least 10 digits
  const phoneRegex = /^\d{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function isValidAge(age: number): boolean {
  return age >= 10 && age <= 120;
}

export function isValidPIN(pin: string): boolean {
  return pin.length === 4 && /^\d+$/.test(pin);
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

export async function validateUserData(data: {
  name: string;
  age: string;
  phone: string;
  email: string;
}): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!isValidName(data.name)) {
    errors.push('Name must be at least 2 characters');
  }

  const ageNum = Number(data.age);
  if (isNaN(ageNum) || !isValidAge(ageNum)) {
    errors.push('Age must be between 10 and 120');
  }

  if (!isValidPhoneNumber(data.phone)) {
    errors.push('Phone number must be at least 10 digits');
  }

  if (!isValidEmail(data.email)) {
    errors.push('Email must be valid');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}