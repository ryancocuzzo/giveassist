const error_print = (err) => console.error(err);

export async function packaged(title, code, err_handle) {
  try {
    code();
  } catch (e) {
    error_print(title + ' caught error: ' + e.toString());
    err_handle(e.toString());
  }
}
