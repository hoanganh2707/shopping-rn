export const getAvatarLink = (fullname) => {
  const arr = fullname.split(' ');
  const firstName = arr[0];
  const lastName = arr[arr.length - 1];
  const first = firstName.charAt(0);
  const last = arr.length >= 2 ? lastName.charAt(0) : '';
  return `https://avatar.iran.liara.run/username?username=${first + last}`;
};
