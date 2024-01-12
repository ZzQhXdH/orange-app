use std::borrow::Cow;
use tauri::Window;
use tokio::sync::Mutex;
use crate::error::AppErr;
use self::conn::{DeviceConn, SharedConn};

mod conn;
mod proto;

static CONN: Mutex<Option<SharedConn>> = Mutex::const_new(None);

#[tauri::command]
pub fn serial_port_name() -> Result<Vec<String>, AppErr> {
    let infos = tokio_serial::available_ports()?;
    let names: Vec<String> = infos
        .iter()
        .map(|info| info.port_name.to_string())
        .collect();
    Ok(names)
}

#[tauri::command]
pub async fn conn_open(window: Window, name: String) -> Result<(), AppErr> {
    conn_close().await?;

    let conn = DeviceConn::new(window, &name)?;
    let mut c = CONN.lock().await;
    *c = Some(conn);
    Ok(())
}

#[tauri::command]
pub async fn conn_write(buf: Box<[u8]>) -> Result<(), AppErr> {

    let conn = CONN.lock().await;
    match &*conn {
        Some(conn) => {
            conn.write(&buf).await?;
        }
        None => {
            return Err(AppErr::Wrap(Cow::Borrowed("串口已经关闭或者没有打开")));
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn conn_close() -> Result<(), AppErr> {
    let mut conn = CONN.lock().await;
    if let Some(conn) = &*conn {
        conn.exit_reader();
    }
    *conn = None;
    Ok(())
}

#[tauri::command]
pub async fn conn_is_open() -> bool {
    CONN.lock().await.is_some()
}
