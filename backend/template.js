export default ({ body }) => {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <div>${body}</div>
      </body>
    </html>
  `;
};