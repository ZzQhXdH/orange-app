// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use error::{AppErr, ErrorWrap};
use serde::Deserialize;
use tauri::{PhysicalPosition, Window};
mod device;
mod error;
mod utils;

mod api;

#[derive(Debug, Deserialize)]
struct Pos {
    x: i32,
    y: i32,
}

#[tauri::command]
fn set_position_offset(pos: Pos, win: Window) -> Result<(), AppErr> {
    let p = win.inner_position().wrap()?;
    win.set_position(PhysicalPosition::new(p.x + pos.x, p.y + pos.y))
        .wrap()?;
    Ok(())
}




fn main() -> Result<(), AppErr> {
    api::run();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            device::serial_port_name,
            device::conn_open,
            device::conn_write,
            device::conn_close,
            device::conn_is_open,
            set_position_offset
        ])
        .run(tauri::generate_context!())
        .wrap()?;

    Ok(())
}
