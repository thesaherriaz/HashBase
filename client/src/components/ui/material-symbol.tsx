import { cn } from "@/lib/utils";

interface MaterialSymbolProps {
  icon: string;
  fill?: boolean;
  weight?: "100" | "200" | "300" | "400" | "500" | "600" | "700";
  grade?: "n25" | "0" | "200";
  size?: "20px" | "24px" | "40px" | "48px";
  className?: string;
}

export function MaterialSymbol({
  icon,
  fill = false,
  weight = "400",
  grade = "0",
  size = "24px",
  className,
}: MaterialSymbolProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined",
        {
          "material-symbols-filled": fill,
        },
        className
      )}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}`,
        fontSize: size,
      }}
    >
      {icon}
    </span>
  );
}
