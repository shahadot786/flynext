import { z } from 'zod';

// ─── Passenger Form Schema ─────────────────────────────────
// No Frequent Flyer field per user request

export const PassengerFormSchema = z
  .object({
    givenName: z.string().min(2, "Given name must be at least 2 characters"),
    surname: z.string().min(2, "Last name is required"),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Gender is required",
    }),
    nationality: z.string().min(2, "Nationality is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    phoneCode: z.string().min(1, "Country code is required"),
    phoneNumber: z
      .string()
      .min(7, "Phone number must be at least 7 digits")
      .regex(/^[0-9]+$/, "Invalid phone number"),
    email: z.string().email("Invalid email address"),
    postCode: z.string().min(3, "Zip code is required"),
  })
  .refine(
    (data) => {
      if (data.phoneCode === "+880") {
        return /^(01|1)[3-9][0-9]{8}$/.test(data.phoneNumber);
      }
      return true;
    },
    {
      message:
        "Invalid Bangladesh phone number. Format should be 01XXXXXXXXX or 1XXXXXXXXX.",
      path: ["phoneNumber"],
    }
  );

export type PassengerFormData = z.infer<typeof PassengerFormSchema>;

// ─── Add-On Services Schema ────────────────────────────────

export const AddOnSchema = z.object({
  mealType: z.string().default('standard'),
  wheelchairRequired: z.boolean().default(false),
  insuranceId: z.string().default('none'),
  specialRequests: z.string().optional(),
});

export type AddOnFormData = z.infer<typeof AddOnSchema>;

// ─── Extra Baggage Schema ──────────────────────────────────

export const BaggageSchema = z.object({
  extraBaggageId: z.string().default('bag_0'),
});

export type BaggageFormData = z.infer<typeof BaggageSchema>;

// ─── Seat Selection Schema ─────────────────────────────────

export const SeatSchema = z.object({
  seatNumber: z.string().optional(),
});

export type SeatFormData = z.infer<typeof SeatSchema>;

// ─── Payment Schema ────────────────────────────────────────

export const PaymentFormSchema = z.object({
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  cardNumber: z.string().regex(/^[0-9]{16}$/, 'Card number must be 16 digits'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Format: MM/YY'),
  cvv: z.string().regex(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
});

export type PaymentFormData = z.infer<typeof PaymentFormSchema>;

// ─── Complete Booking Form Schema ──────────────────────────

export const BookingFormSchema = z.object({
  passengers: z.array(PassengerFormSchema).min(1),
  addOns: z.array(AddOnSchema),
  baggage: z.array(BaggageSchema),
  seats: z.array(SeatSchema),
  payment: PaymentFormSchema,
});

export type BookingFormSchemaData = z.infer<typeof BookingFormSchema>;
