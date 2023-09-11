FROM debian
RUN apt-get update && apt-get install -y vsftpd
COPY vsftpd.conf /etc/
COPY virtual_users.txt /etc/
EXPOSE 20 21
CMD ["vsftpd", "/etc/vsftpd.conf"]
