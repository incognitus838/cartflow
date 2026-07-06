"use client";

import type { ProductMetadata } from "@/lib/products/metadata";
import { PRODUCT_TYPE_CONFIG } from "@/lib/products/product-type-config";
import type { ProductType } from "@/lib/products/product-types";

type ProductTypeDetailsProps = {
  type: ProductType;
  metadata: ProductMetadata;
  stock: string;
  lowStockThreshold: string;
  useVariants: boolean;
  onMetadataChange: <K extends keyof ProductMetadata>(
    key: K,
    value: ProductMetadata[K],
  ) => void;
  onStockChange: (value: string) => void;
  onLowStockChange: (value: string) => void;
};

export function ProductTypeDetails({
  type,
  metadata,
  stock,
  lowStockThreshold,
  useVariants,
  onMetadataChange,
  onStockChange,
  onLowStockChange,
}: ProductTypeDetailsProps) {
  const config = PRODUCT_TYPE_CONFIG[type];

  function patchCustomField(key: string, value: string) {
    onMetadataChange("customFields", { ...metadata.customFields, [key]: value });
  }

  return (
    <section
      key={type}
      className="cf-product-type-panel"
      aria-labelledby={`product-type-panel-${type}`}
    >
      <div className="cf-product-type-panel__header">
        <h3 id={`product-type-panel-${type}`} className="text-[15px] font-semibold text-[#1d1d1f]">
          {config.title}
        </h3>
        <p className="mt-1 text-[12px] text-[#86868b]">{config.subtitle}</p>
      </div>

      {type === "PHYSICAL" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="physical-sku" className="cf-product-label">
              SKU / product code
            </label>
            <input
              id="physical-sku"
              value={metadata.sku}
              onChange={(e) => onMetadataChange("sku", e.target.value)}
              className="cf-input mt-2"
              placeholder="ANK-DRESS-12"
            />
          </div>
          <div>
            <label htmlFor="physical-weight" className="cf-product-label">
              Weight (kg)
            </label>
            <input
              id="physical-weight"
              type="number"
              min={0}
              step="0.01"
              value={metadata.weightKg}
              onChange={(e) => onMetadataChange("weightKg", e.target.value)}
              className="cf-input mt-2"
              placeholder="0.45"
            />
          </div>
          {!useVariants ? (
            <div>
              <label htmlFor="physical-stock" className="cf-product-label">
                Stock quantity
              </label>
              <input
                id="physical-stock"
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => onStockChange(e.target.value)}
                className="cf-input mt-2"
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="physical-low-stock" className="cf-product-label">
              Low-stock alert
            </label>
            <input
              id="physical-low-stock"
              type="number"
              min={0}
              value={lowStockThreshold}
              onChange={(e) => onLowStockChange(e.target.value)}
              className="cf-input mt-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="physical-shipping" className="cf-product-label">
              Shipping notes
            </label>
            <textarea
              id="physical-shipping"
              rows={2}
              value={metadata.shippingNotes}
              onChange={(e) => onMetadataChange("shippingNotes", e.target.value)}
              className="cf-input mt-2 resize-y"
              placeholder="Nationwide delivery in 2–3 days. Lagos same-day dispatch."
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="physical-dimensions" className="cf-product-label">
              Dimensions (optional)
            </label>
            <input
              id="physical-dimensions"
              value={metadata.customFields.dimensions ?? ""}
              onChange={(e) => patchCustomField("dimensions", e.target.value)}
              className="cf-input mt-2"
              placeholder="30 × 20 × 8 cm"
            />
          </div>
        </div>
      ) : null}

      {type === "DIGITAL" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="digital-delivery-url" className="cf-product-label">
              Auto-delivery link <span className="text-[#b8956a]">*</span>
            </label>
            <input
              id="digital-delivery-url"
              type="url"
              required
              value={metadata.digitalDeliveryUrl}
              onChange={(e) => onMetadataChange("digitalDeliveryUrl", e.target.value)}
              className="cf-input mt-2"
              placeholder="https://course.example.com/access or Google Drive link"
            />
            <p className="mt-1.5 text-[11px] text-[#86868b]">
              Sent to the customer after you approve payment — course page, PDF, or download link.
            </p>
          </div>
          <div>
            <label htmlFor="digital-file-type" className="cf-product-label">
              File / product type
            </label>
            <select
              id="digital-file-type"
              value={metadata.digitalFileType}
              onChange={(e) => onMetadataChange("digitalFileType", e.target.value)}
              className="cf-input mt-2"
            >
              <option value="">Select type</option>
              <option value="course">Online course</option>
              <option value="ebook">eBook / PDF</option>
              <option value="template">Template / Canva file</option>
              <option value="video">Video / recording</option>
              <option value="membership">Membership access</option>
            </select>
          </div>
          <div>
            <label htmlFor="digital-duration" className="cf-product-label">
              Duration / length
            </label>
            <input
              id="digital-duration"
              value={metadata.customFields.duration ?? ""}
              onChange={(e) => patchCustomField("duration", e.target.value)}
              className="cf-input mt-2"
              placeholder="6 weeks · 12 lessons"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="digital-access" className="cf-product-label">
              Access instructions
            </label>
            <textarea
              id="digital-access"
              rows={3}
              value={metadata.accessInstructions}
              onChange={(e) => onMetadataChange("accessInstructions", e.target.value)}
              className="cf-input mt-2 resize-y"
              placeholder="Check your email for login details. Link expires in 30 days."
            />
          </div>
          <div className="sm:col-span-2 rounded-[12px] border border-[#b8956a]/25 bg-[#fffdf8] px-4 py-3 text-[12px] text-[#6e6e73]">
            Digital products have <strong className="text-[#1d1d1f]">unlimited stock</strong> — no
            inventory count needed. Use variants for modules or tiers.
          </div>
        </div>
      ) : null}

      {type === "FOOD" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="food-unit" className="cf-product-label">
              Unit / portion
            </label>
            <input
              id="food-unit"
              value={metadata.unitOfMeasure}
              onChange={(e) => onMetadataChange("unitOfMeasure", e.target.value)}
              className="cf-input mt-2"
              placeholder="5 tubers · 1 crate · 500g"
            />
          </div>
          <div>
            <label htmlFor="food-expiry" className="cf-product-label">
              Best before / expiry
            </label>
            <input
              id="food-expiry"
              type="date"
              value={metadata.expiryDate}
              onChange={(e) => onMetadataChange("expiryDate", e.target.value)}
              className="cf-input mt-2"
            />
          </div>
          {!useVariants ? (
            <div>
              <label htmlFor="food-stock" className="cf-product-label">
                Available quantity
              </label>
              <input
                id="food-stock"
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => onStockChange(e.target.value)}
                className="cf-input mt-2"
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="food-prep" className="cf-product-label">
              Preparation time (minutes)
            </label>
            <input
              id="food-prep"
              type="number"
              min={0}
              value={metadata.prepTimeMinutes}
              onChange={(e) => onMetadataChange("prepTimeMinutes", e.target.value)}
              className="cf-input mt-2"
              placeholder="45"
            />
          </div>
          <div>
            <label htmlFor="food-low-stock" className="cf-product-label">
              Low-stock alert
            </label>
            <input
              id="food-low-stock"
              type="number"
              min={0}
              value={lowStockThreshold}
              onChange={(e) => onLowStockChange(e.target.value)}
              className="cf-input mt-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="food-ingredients" className="cf-product-label">
              Ingredients / contents
            </label>
            <textarea
              id="food-ingredients"
              rows={3}
              value={metadata.customFields.ingredients ?? ""}
              onChange={(e) => patchCustomField("ingredients", e.target.value)}
              className="cf-input mt-2 resize-y"
              placeholder="Yam, no additives. Grown in Benue."
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="food-storage" className="cf-product-label">
              Storage & handling
            </label>
            <textarea
              id="food-storage"
              rows={2}
              value={metadata.storageInstructions}
              onChange={(e) => onMetadataChange("storageInstructions", e.target.value)}
              className="cf-input mt-2 resize-y"
              placeholder="Keep refrigerated. Best consumed within 3 days."
            />
          </div>
        </div>
      ) : null}

      {type === "SERVICE" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="service-duration" className="cf-product-label">
              Service duration
            </label>
            <input
              id="service-duration"
              value={metadata.serviceDuration}
              onChange={(e) => onMetadataChange("serviceDuration", e.target.value)}
              className="cf-input mt-2"
              placeholder="45 min · Party tray · Full day"
            />
          </div>
          <div>
            <label htmlFor="service-lead-time" className="cf-product-label">
              Order lead time
            </label>
            <input
              id="service-lead-time"
              value={metadata.bookingLeadTime}
              onChange={(e) => onMetadataChange("bookingLeadTime", e.target.value)}
              className="cf-input mt-2"
              placeholder="Order 24 hours ahead"
            />
          </div>
          <div>
            <label htmlFor="service-portion" className="cf-product-label">
              Portion / serving size
            </label>
            <input
              id="service-portion"
              value={metadata.customFields.portionSize ?? ""}
              onChange={(e) => patchCustomField("portionSize", e.target.value)}
              className="cf-input mt-2"
              placeholder="Serves 10–12 people"
            />
          </div>
          <div>
            <label htmlFor="service-prep" className="cf-product-label">
              Prep time (minutes)
            </label>
            <input
              id="service-prep"
              type="number"
              min={0}
              value={metadata.prepTimeMinutes}
              onChange={(e) => onMetadataChange("prepTimeMinutes", e.target.value)}
              className="cf-input mt-2"
              placeholder="60"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="service-availability" className="cf-product-label">
              Availability
            </label>
            <textarea
              id="service-availability"
              rows={2}
              value={metadata.availabilityNotes}
              onChange={(e) => onMetadataChange("availabilityNotes", e.target.value)}
              className="cf-input mt-2 resize-y"
              placeholder="Mon–Sat 9am–6pm. Sunday by request only."
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="service-booking" className="cf-product-label">
              Booking / ordering notes
            </label>
            <textarea
              id="service-booking"
              rows={2}
              value={metadata.customFields.bookingNotes ?? ""}
              onChange={(e) => patchCustomField("bookingNotes", e.target.value)}
              className="cf-input mt-2 resize-y"
              placeholder="WhatsApp your event date after payment. Deposit may apply."
            />
          </div>
          <div className="sm:col-span-2 rounded-[12px] border border-[#b8956a]/25 bg-[#fffdf8] px-4 py-3 text-[12px] text-[#6e6e73]">
            Services usually don&apos;t need stock counts. Use variants for sizes, add-ons, or
            menu options.
          </div>
        </div>
      ) : null}
    </section>
  );
}