@echo off
tasklist /v /FI "WINDOWTITLE eq Discord Bot*"
set myvar=0
for /f "tokens=2" %%a in ('tasklist /v /FI "WINDOWTITLE eq Discord Bot*"^|find /i "Discord Bot"') do (set pid=%%a & goto point) 

:point
echo "%pid%"
>processID.txt echo "%pid%"
Taskkill /F /PID "%pid%" /T