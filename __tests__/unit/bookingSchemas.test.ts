import { describe, test, expect } from 'vitest';
import {
  PassengerFormSchema,
  PaymentFormSchema,
  BookingFormSchema,
} from '../../src/features/booking/schemas/bookingSchemas';

describe('Booking Schemas Validation', () => {
  describe('PassengerFormSchema', () => {
    const validPassenger = {
      givenName: 'John',
      surname: 'Doe',
      gender: 'male',
      nationality: 'BD',
      dateOfBirth: '1990-01-01',
      phoneCode: '+880',
      phoneNumber: '1712345678',
      email: 'john.doe@example.com',
      postCode: '1230',
    };

    test('valid passenger passes validation', () => {
      const result = PassengerFormSchema.safeParse(validPassenger);
      expect(result.success).toBe(true);
    });

    test('fails if given name is too short', () => {
      const invalid = { ...validPassenger, givenName: 'J' };
      const result = PassengerFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('Given name must be at least 2 characters');
      }
    });

    test('fails if email is invalid', () => {
      const invalid = { ...validPassenger, email: 'not-an-email' };
      const result = PassengerFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('Invalid email address');
      }
    });

    test('fails if phoneNumber contains non-numeric characters', () => {
      const invalid = { ...validPassenger, phoneNumber: '17123-4567' };
      const result = PassengerFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toContain('Invalid phone number');
      }
    });

    describe('Bangladesh phone number selective validation (+880)', () => {
      test('passes for valid 11-digit numbers starting with 01 and valid operator', () => {
        const validOperators = ['3', '4', '5', '6', '7', '8', '9'];
        validOperators.forEach((op) => {
          const valid = { ...validPassenger, phoneCode: '+880', phoneNumber: `01${op}12345678` };
          const result = PassengerFormSchema.safeParse(valid);
          expect(result.success).toBe(true);
        });
      });

      test('passes for valid 10-digit numbers starting with 1 and valid operator', () => {
        const validOperators = ['3', '4', '5', '6', '7', '8', '9'];
        validOperators.forEach((op) => {
          const valid = { ...validPassenger, phoneCode: '+880', phoneNumber: `1${op}12345678` };
          const result = PassengerFormSchema.safeParse(valid);
          expect(result.success).toBe(true);
        });
      });

      test('fails for invalid operator digits (like 0, 1, 2)', () => {
        const invalidOperators = ['0', '1', '2'];
        invalidOperators.forEach((op) => {
          const invalid = { ...validPassenger, phoneCode: '+880', phoneNumber: `01${op}1234567` };
          const result = PassengerFormSchema.safeParse(invalid);
          expect(result.success).toBe(false);
        });
      });

      test('fails for incorrect lengths', () => {
        // too short
        const short1 = { ...validPassenger, phoneCode: '+880', phoneNumber: '01712345' };
        expect(PassengerFormSchema.safeParse(short1).success).toBe(false);
        
        // too long
        const long1 = { ...validPassenger, phoneCode: '+880', phoneNumber: '017123456789' };
        expect(PassengerFormSchema.safeParse(long1).success).toBe(false);
      });
    });

    describe('International phone number validation (other than +880)', () => {
      test('passes standard numbers with standard lengths (>=7 digits) and any digits', () => {
        const validUS = { ...validPassenger, phoneCode: '+1', phoneNumber: '2025550143' };
        const result = PassengerFormSchema.safeParse(validUS);
        expect(result.success).toBe(true);
      });

      test('passes numbers that would fail BD check (like starting with 2)', () => {
        const validUS = { ...validPassenger, phoneCode: '+1', phoneNumber: '2125550199' };
        const result = PassengerFormSchema.safeParse(validUS);
        expect(result.success).toBe(true);
      });

      test('fails for numbers shorter than 7 digits', () => {
        const invalidShort = { ...validPassenger, phoneCode: '+1', phoneNumber: '123456' };
        const result = PassengerFormSchema.safeParse(invalidShort);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('PaymentFormSchema', () => {
    const validPayment = {
      cardholderName: 'John Doe',
      cardNumber: '1234567812345678',
      expiryDate: '12/28',
      cvv: '123',
    };

    test('valid payment passes validation', () => {
      const result = PaymentFormSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    test('fails if cardNumber is not 16 digits', () => {
      const invalid = { ...validPayment, cardNumber: '12345678' };
      const result = PaymentFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    test('fails if expiryDate format is invalid', () => {
      const invalid = { ...validPayment, expiryDate: '28/12' }; // should be MM/YY
      const result = PaymentFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    test('fails if cvv format is invalid', () => {
      const invalid = { ...validPayment, cvv: '12' };
      const result = PaymentFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('BookingFormSchema', () => {
    test('validates nested fields correctly', () => {
      const validBooking = {
        passengers: [
          {
            givenName: 'John',
            surname: 'Doe',
            gender: 'male',
            nationality: 'BD',
            dateOfBirth: '1990-01-01',
            phoneCode: '+880',
            phoneNumber: '1712345678',
            email: 'john.doe@example.com',
            postCode: '1230',
          },
        ],
        addOns: [
          {
            mealType: 'vegetarian',
            wheelchairRequired: false,
            insuranceId: 'none',
          },
        ],
        baggage: [
          {
            extraBaggageId: 'bag_0',
          },
        ],
        seats: [
          {
            seatNumber: '12A',
          },
        ],
        payment: {
          cardholderName: 'John Doe',
          cardNumber: '1234567812345678',
          expiryDate: '12/28',
          cvv: '123',
        },
      };

      const result = BookingFormSchema.safeParse(validBooking);
      expect(result.success).toBe(true);
    });
  });
});
