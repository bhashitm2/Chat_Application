// Local WhatsApp-style default avatar shown whenever a user has no photo
// (empty profilePic) or their stored image fails to load. Served from
// frontend/public, so there is no dependency on any external avatar service.
export const DEFAULT_AVATAR = "/default-avatar.svg";

// Only a photo the user actually uploaded (stored under /uploads/) counts as a
// real display picture. Anything else — an empty value, or a legacy URL from a
// now-dead auto-generated avatar service (avatar.iran.liara.run, ui-avatars.com)
// — shows the WhatsApp-style default silhouette. This also means we never make a
// request to an external avatar host, so a dead service can't hang the image.
export const resolveAvatar = (profilePic) =>
	profilePic && profilePic.startsWith("/uploads/") ? profilePic : DEFAULT_AVATAR;

// onError handler: fall back to the default once, avoiding an infinite loop
export const onAvatarError = (e) => {
	if (e.currentTarget.dataset.fallback === "1") return;
	e.currentTarget.dataset.fallback = "1";
	e.currentTarget.src = DEFAULT_AVATAR;
};
