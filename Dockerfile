FROM nginx:1.27-alpine
COPY index.html /usr/share/nginx/html/index.html
COPY water-tracker-hydration/ /usr/share/nginx/html/water-tracker-hydration/
COPY cv-drawer/ /usr/share/nginx/html/cv-drawer/
