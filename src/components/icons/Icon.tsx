import DefaultProfilePictureIcon from "./svg/DefaultProfilePictureIcon";

const icons = {
  defaultProfilePic: DefaultProfilePictureIcon,
} as const;

export type IconName = keyof typeof icons;

export type IconProps = { name: IconName, className: string };

const Icon = ({ name, className }: IconProps) => {
  const SVG = icons[name];
  return (
    <div className={className}>
      <SVG />
    </div>
  )
}

export default Icon;
