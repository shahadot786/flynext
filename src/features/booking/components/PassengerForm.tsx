"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/shared/utils/cn";
import { PassengerFormSchema } from "@/features/booking/schemas/bookingSchemas";
import type { PassengerCount } from "@/shared/types";
import countriesData from "@/data/countries.json";

// ─── Types ─────────────────────────────────────────────────

type PassengerEntry = z.infer<typeof PassengerFormSchema>;

type PassengerFormProps = {
  passengerCount: PassengerCount;
  initialData?: PassengerEntry[];
  onSubmit: (data: PassengerEntry[]) => void;
};

// Helper to convert 2-letter country code to flag emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// ─── Build Passenger List ──────────────────────────────────

function buildPassengerSlots(count: PassengerCount) {
  const slots: {
    type: "adult" | "child" | "kid" | "infant";
    label: string;
    index: number;
  }[] = [];
  let idx = 1;
  for (let i = 0; i < count.adults; i++) {
    slots.push({ type: "adult", label: `Adult ${i + 1}`, index: idx++ });
  }
  for (let i = 0; i < count.children; i++) {
    slots.push({ type: "child", label: `Child ${i + 1}`, index: idx++ });
  }
  for (let i = 0; i < count.kids; i++) {
    slots.push({ type: "kid", label: `Kid ${i + 1}`, index: idx++ });
  }
  for (let i = 0; i < count.infants; i++) {
    slots.push({ type: "infant", label: `Infant ${i + 1}`, index: idx++ });
  }
  return slots;
}

const TYPE_COLORS = {
  adult: "bg-primary-100 text-primary-700 border-primary-200",
  child: "bg-amber-100 text-amber-700 border-amber-200",
  kid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  infant: "bg-rose-100 text-rose-700 border-rose-200",
} as const;

const emptyPassenger: PassengerEntry = {
  givenName: "",
  surname: "",
  gender: "male",
  nationality: "Bangladesh",
  dateOfBirth: "",
  phoneCode: "+880",
  phoneNumber: "",
  email: "",
  postCode: "",
};

// ─── Component ─────────────────────────────────────────────

export function PassengerForm({
  passengerCount,
  initialData,
  onSubmit,
}: PassengerFormProps) {
  const slots = useMemo(
    () => buildPassengerSlots(passengerCount),
    [passengerCount],
  );
  const [activePassenger, setActivePassenger] = useState(0);
  const [nationalitySearch, setNationalitySearch] = useState("");
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [isPhoneCodeOpen, setIsPhoneCodeOpen] = useState(false);
  const [phoneCodeSearch, setPhoneCodeSearch] = useState("");

  const formSchema = z.object({
    passengers: z.array(PassengerFormSchema).min(1),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<{ passengers: PassengerEntry[] }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers:
        initialData && initialData.length > 0
          ? initialData
          : slots.map(() => ({ ...emptyPassenger })),
    },
    mode: "onBlur",
  });

  const { fields } = useFieldArray({ control, name: "passengers" });

  const validatedCount = useMemo(() => {
    if (!errors.passengers) return fields.length;
    let count = 0;
    for (let i = 0; i < fields.length; i++) {
      if (!errors.passengers[i]) count++;
    }
    return count;
  }, [errors.passengers, fields.length]);

  const filteredCountries = useMemo(
    () =>
      nationalitySearch
        ? countriesData.filter((c) =>
            c.name.toLowerCase().includes(nationalitySearch.toLowerCase()),
          )
        : countriesData,
    [nationalitySearch],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentNationality = watch(`passengers.${activePassenger}.nationality`);
  const currentPhoneCode = watch(`passengers.${activePassenger}.phoneCode`) || "+880";

  const currentCountryCode = useMemo(() => {
    const found = countriesData.find((c) => c.dialCode === currentPhoneCode);
    return found ? found.code : "BD";
  }, [currentPhoneCode]);

  const filteredPhoneCountries = useMemo(() => {
    const search = phoneCodeSearch.toLowerCase().trim();
    if (!search) return countriesData;
    return countriesData.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.dialCode.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search)
    );
  }, [phoneCodeSearch]);

  const handleAutoFill = () => {
    const slot = slots[activePassenger];
    const type = slot?.type ?? "adult";

    let givenName = "John";
    let surname = `Doe ${activePassenger + 1}`;
    let dob = "1990-01-01";
    let gender: "male" | "female" | "other" = "male";
    const phoneCode = "+880";
    const phoneNumber = `171234567${activePassenger}`;
    let email = `john.doe.${activePassenger + 1}@example.com`;
    const postCode = "1212";

    if (type === "adult") {
      if (activePassenger === 0) {
        givenName = "Shahadot";
        surname = "Hossain";
        dob = "1995-06-15";
        gender = "male";
        email = "shahadot@example.com";
      } else {
        givenName = "Aisha";
        surname = `Rahman`;
        dob = "1997-03-22";
        gender = "female";
        email = `aisha.rahman@example.com`;
      }
    } else if (type === "child") {
      givenName = "Fahim";
      surname = `Hossain`;
      dob = "2016-08-10";
      gender = "male";
      email = "fahim@example.com";
    } else if (type === "kid") {
      givenName = "Zara";
      surname = `Hossain`;
      dob = "2021-11-05";
      gender = "female";
      email = "zara@example.com";
    } else if (type === "infant") {
      givenName = "Baby";
      surname = `Hossain`;
      dob = "2025-02-14";
      gender = "other";
      email = "baby@example.com";
    }

    // Set values explicitly to avoid implicit any / dynamic casting eslint warnings
    setValue(`passengers.${activePassenger}.givenName`, givenName, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`passengers.${activePassenger}.surname`, surname, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`passengers.${activePassenger}.gender`, gender, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`passengers.${activePassenger}.nationality`, "Bangladesh", {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`passengers.${activePassenger}.dateOfBirth`, dob, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`passengers.${activePassenger}.phoneCode`, phoneCode, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`passengers.${activePassenger}.phoneNumber`, phoneNumber, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`passengers.${activePassenger}.email`, email, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`passengers.${activePassenger}.postCode`, postCode, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleFormSubmit = (data: { passengers: PassengerEntry[] }) => {
    onSubmit(data.passengers);
  };

  const handleNextPassenger = async () => {
    const valid = await trigger(`passengers.${activePassenger}`);
    if (valid && activePassenger < fields.length - 1) {
      setActivePassenger(activePassenger + 1);
    }
  };

  const paxErrors = errors.passengers?.[activePassenger];

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="w-full"
      id="passenger-form"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="text-lg font-extrabold text-gray-900">
          Provide Passenger Details
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAutoFill}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg border border-primary-200 transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            ⚡ Demo Details
          </button>
          <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
            {validatedCount} of {fields.length} validated
          </span>
        </div>
      </div>

      {/* Passengers tabs */}
      {fields.length > 1 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          {slots.map((slot, i) => (
            <button
              key={fields[i]?.id}
              type="button"
              onClick={() => setActivePassenger(i)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                i === activePassenger
                  ? "bg-primary-600 text-white border-primary-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
              )}
            >
              <span
                className={cn(
                  "flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-black",
                  i === activePassenger
                    ? "bg-white text-primary-600"
                    : "bg-gray-200 text-gray-500",
                )}
              >
                {i + 1}
              </span>
              <span>{slot.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active passenger header */}
      <div className="bg-primary-600 text-white rounded-t-lg px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center bg-white text-primary-600 rounded-full text-[10px] font-black">
            {activePassenger + 1}
          </span>
          <span className="text-sm font-bold">
            {slots[activePassenger]?.type === "adult"
              ? "Primary"
              : slots[activePassenger]?.label}{" "}
            Passenger
          </span>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
            TYPE_COLORS[slots[activePassenger]?.type ?? "adult"],
          )}
        >
          {(slots[activePassenger]?.type ?? "adult").toUpperCase()}
        </span>
      </div>

      {/* Passport hint */}
      <div className="bg-blue-50 border border-blue-100 rounded-b-lg rounded-none px-4 py-3 mb-5">
        <div className="flex items-start gap-2.5">
          <svg
            className="h-4 w-4 text-blue-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <p className="text-xs text-blue-700 font-semibold leading-relaxed">
            Provide all the information{" "}
            <strong>exactly as they appear in the passport</strong> to avoid
            boarding complications.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Row: Given Name + Surname */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Given Name
            </label>
            <input
              {...register(`passengers.${activePassenger}.givenName`)}
              placeholder="Enter given name"
              className={cn(
                "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all",
                paxErrors?.givenName
                  ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
              )}
            />
            {paxErrors?.givenName && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {paxErrors.givenName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">
              <span className="text-red-500">Surname</span>{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              {...register(`passengers.${activePassenger}.surname`)}
              placeholder="Enter surname"
              className={cn(
                "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all",
                paxErrors?.surname
                  ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
              )}
            />
            {paxErrors?.surname && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {paxErrors.surname.message}
              </p>
            )}
          </div>
        </div>

        {/* Row: Gender + Nationality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">
              <span className="text-gray-700">Select Gender</span>{" "}
              <span className="text-red-400">*</span>
            </label>
            <select
              {...register(`passengers.${activePassenger}.gender`)}
              className={cn(
                "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all appearance-none bg-white cursor-pointer",
                paxErrors?.gender
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
              )}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {paxErrors?.gender && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {paxErrors.gender.message}
              </p>
            )}
          </div>
          <div className="relative">
            <label className="block text-xs font-bold mb-1.5">
              <span className="text-gray-700">Select Nationality</span>{" "}
              <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsNationalityOpen((p) => !p)}
              className={cn(
                "w-full border rounded-lg px-3.5 py-2.5 text-sm font-medium text-left outline-none transition-all flex items-center justify-between cursor-pointer",
                paxErrors?.nationality
                  ? "border-red-400 bg-red-50/50 text-red-600"
                  : "border-gray-200 bg-white text-gray-800 focus:border-primary-400",
              )}
            >
              <span>{currentNationality || "Select nationality"}</span>
              <svg
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  isNationalityOpen && "rotate-180",
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
            {isNationalityOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={nationalitySearch}
                    onChange={(e) => setNationalitySearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-primary-400"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-44">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setValue(
                          `passengers.${activePassenger}.nationality`,
                          country.name,
                          { shouldValidate: true },
                        );
                        setIsNationalityOpen(false);
                        setNationalitySearch("");
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm font-medium hover:bg-primary-50 transition-colors cursor-pointer",
                        currentNationality === country.name
                          ? "bg-primary-50 text-primary-700 font-bold"
                          : "text-gray-700",
                      )}
                    >
                      {country.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {paxErrors?.nationality && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {paxErrors.nationality.message}
              </p>
            )}
          </div>
        </div>

        {/* Row: Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">
              <span className="text-gray-700">Date of Birth</span>{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              {...register(`passengers.${activePassenger}.dateOfBirth`)}
              className={cn(
                "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all cursor-pointer",
                paxErrors?.dateOfBirth
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
              )}
            />
            <p className="text-[10px] text-gray-400 font-medium mt-1">
              {slots[activePassenger]?.type === "adult"
                ? "Must be 12 years or older"
                : slots[activePassenger]?.type === "child"
                  ? "Age 5-11 years"
                  : slots[activePassenger]?.type === "kid"
                    ? "Age 2-4 years"
                    : "Under 2 years"}
            </p>
            {paxErrors?.dateOfBirth && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {paxErrors.dateOfBirth.message}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            Contact Information
          </h3>
        </div>

        {/* Row: Phone + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">
              <span className="text-gray-700">Phone Number</span>{" "}
              <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 relative">
              <div className="relative w-28 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPhoneCodeOpen((p) => !p)}
                  className={cn(
                    "w-full h-full border rounded-lg px-2.5 py-2.5 text-sm font-medium outline-none transition-all flex items-center justify-between cursor-pointer bg-white",
                    paxErrors?.phoneCode
                      ? "border-red-400 bg-red-50/50 text-red-600"
                      : "border-gray-200 text-gray-800 focus:border-primary-400",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{getFlagEmoji(currentCountryCode)}</span>
                    <span className="font-extrabold">{currentPhoneCode}</span>
                  </span>
                  <svg
                    className={cn(
                      "h-4 w-4 text-gray-400 transition-transform shrink-0 ml-1",
                      isPhoneCodeOpen && "rotate-180",
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {isPhoneCodeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => {
                        setIsPhoneCodeOpen(false);
                        setPhoneCodeSearch("");
                      }}
                    />
                    <div className="absolute z-50 bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-hidden w-64">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={phoneCodeSearch}
                          onChange={(e) => setPhoneCodeSearch(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-primary-400"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-44">
                        {filteredPhoneCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setValue(
                                `passengers.${activePassenger}.phoneCode`,
                                c.dialCode,
                                { shouldValidate: true },
                              );
                              setIsPhoneCodeOpen(false);
                              setPhoneCodeSearch("");
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm font-medium hover:bg-primary-50 transition-colors cursor-pointer flex items-center justify-between",
                              currentPhoneCode === c.dialCode
                                ? "bg-primary-50 text-primary-700 font-bold"
                                : "text-gray-700",
                            )}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span>{getFlagEmoji(c.code)}</span>
                              <span className="truncate">{c.name}</span>
                            </span>
                            <span className="text-gray-400 text-xs shrink-0 font-bold ml-2">
                              {c.dialCode}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Hidden input to keep React Hook Form registration intact */}
              <input
                type="hidden"
                {...register(`passengers.${activePassenger}.phoneCode`)}
              />

              <input
                type="tel"
                {...register(`passengers.${activePassenger}.phoneNumber`)}
                placeholder="Phone number"
                className={cn(
                  "flex-1 border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all",
                  paxErrors?.phoneNumber
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
                )}
              />
            </div>
            {paxErrors?.phoneNumber && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {paxErrors.phoneNumber.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">
              <span className="text-gray-700">Email</span>{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              {...register(`passengers.${activePassenger}.email`)}
              placeholder="Enter email address"
              className={cn(
                "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all",
                paxErrors?.email
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
              )}
            />
            {paxErrors?.email && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {paxErrors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Row: Post Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">
              <span className="text-gray-700">Post Code</span>{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              {...register(`passengers.${activePassenger}.postCode`)}
              placeholder="Enter zip/post code"
              className={cn(
                "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all",
                paxErrors?.postCode
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
              )}
            />
            {paxErrors?.postCode && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {paxErrors.postCode.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Multiple passenger navigation */}
      {fields.length > 1 && activePassenger < fields.length - 1 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleNextPassenger}
            className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-primary-100 transition-colors cursor-pointer"
          >
            <span>Next Passenger</span>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      )}
    </form>
  );
}
