import ProfileTemplate from "@modules/account/templates/profile-template"

export const metadata = {
  title: "Profile",
  description: "View and edit your ACME profile.",
}

export default function Profile() {
  return <ProfileTemplate />;
}
