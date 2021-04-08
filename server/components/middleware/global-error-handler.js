const globalErrorHandler = function (err, req, res, next) {
  // set locals, only providing error in development
  console.debug(err)
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  const errorMessage = err.message || 'error in processing request'
  // render the error page
  res.json({
    message: errorMessage,
    error: '1001'
  })
}

export default globalErrorHandler
