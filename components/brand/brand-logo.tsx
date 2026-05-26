import Image from "next/image";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils/cn";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showText?: boolean;
  subtitle?: string;
  priority?: boolean;
};

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  showText = true,
  subtitle,
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <Image
        src={brand.logo.src}
        alt={showText ? "" : brand.logo.alt}
        width={72}
        height={72}
        priority={priority}
        className={cn("h-9 w-9 rounded-md object-cover shadow-sm", markClassName)}
      />
      {showText ? (
        <span className={cn("min-w-0", textClassName)}>
          <span className="block font-semibold leading-tight">{brand.shortName}</span>
          {subtitle ? <span className="block text-xs leading-tight text-muted-foreground">{subtitle}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
