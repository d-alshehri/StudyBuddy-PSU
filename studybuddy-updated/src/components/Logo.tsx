import logo from "@/assets/studybuddy-logo.png";

export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const h = size === "lg" ? "h-40" : size === "sm" ? "h-12" : "h-24";
  return (
    <div className="flex items-center justify-center">
      <img src={logo} alt="StudyBuddy" className={`${h} w-auto object-contain`} />
    </div>
  );
};