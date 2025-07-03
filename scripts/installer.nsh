!macro customInit
  ${ifNot} ${isUpdated}
    nsExec::Exec '"$LOCALAPPDATA\coalition_installer\Update.exe" --uninstall -s'
    delete "$LOCALAPPDATA\coalition_installer\Update.exe"
    delete "$LOCALAPPDATA\coalition_installer\.dead"
    rmDir "$LOCALAPPDATA\coalition_installer"
  ${endIf}
!macroend