import { STORE_LOCATION } from "@/constants/storefront.constants";
import { cn } from "@/lib/utils";

export function WhatsAppButton() {
  const phoneNumber = STORE_LOCATION.phoneTel.replace(/\D/g, "");
  const message = "Hello!";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl sm:bottom-9 sm:right-9",
      )}
      aria-label="Chat with us on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8"
      >
        <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.195 1.6 6.015L.305 23.342l5.441-1.428A11.966 11.966 0 0012.031 24c6.645 0 12.031-5.385 12.031-12.031C24.062 5.385 18.677 0 12.031 0zm0 21.996c-1.802 0-3.56-.484-5.111-1.4l-.367-.217-3.8.997 1.018-3.704-.239-.379A9.972 9.972 0 012.035 12.03c0-5.513 4.49-10.003 10.002-10.003 5.513 0 10.003 4.49 10.003 10.003s-4.49 10.003-10.003 10.003zm5.496-7.518c-.302-.151-1.787-.881-2.062-.981-.275-.1-.476-.151-.676.151-.201.302-.778.981-.954 1.182-.176.201-.352.226-.654.075-1.472-.734-2.525-1.341-3.486-2.923-.201-.326.201-.302.778-1.458.101-.201.05-.377-.025-.528-.075-.151-.676-1.635-.928-2.239-.244-.593-.49-.512-.676-.522l-.578-.01c-.2 0-.528.075-.803.377-.275.302-1.054 1.031-1.054 2.515 0 1.484 1.079 2.918 1.23 3.119.151.201 2.122 3.242 5.143 4.545 2.012.868 2.766.93 3.268.78.56-.168 1.787-.731 2.038-1.434.251-.703.251-1.307.176-1.434-.076-.126-.277-.202-.579-.353z" />
      </svg>
    </a>
  );
}
