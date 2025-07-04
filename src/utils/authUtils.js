export const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

export const isAuthPage = (pathname) => {
	return AUTH_PAGES.some((page) => pathname.startsWith(page));
};
