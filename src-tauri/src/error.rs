use serde::Serialize;
use std::borrow::Cow;
use thiserror::Error;
use tokio_serial::Error as SerialErr;

pub type IoErr = std::io::Error;

#[derive(Debug, Error)]
pub enum AppErr {
    #[error("io:{0}")]
    Io(#[from] IoErr),

    #[error("wrap:{0}")]
    Wrap(Cow<'static, str>),

    #[error("serial:{0}")]
    Serial(#[from] SerialErr),

    #[error("proto:{0}")]
    Proto(&'static str),
}

impl AppErr {

    pub fn new_with_msg<T>(msg: &'static str) -> Result<T, AppErr> {
        Err(AppErr::Wrap(Cow::Borrowed(msg)))
    }
}

impl Serialize for AppErr {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let msg = self.to_string();
        serializer.serialize_str(&msg)
    }
}

pub trait ErrorWrap<T> {
    fn wrap(self) -> Result<T, AppErr>;
}

impl<T, E: std::error::Error> ErrorWrap<T> for Result<T, E> {
    fn wrap(self) -> Result<T, AppErr> {
        match self {
            Ok(v) => Ok(v),
            Err(e) => Err(AppErr::Wrap(Cow::Owned(e.to_string()))),
        }
    }
}

pub trait OptionWrap<T> {
    fn wrap(self) -> Result<T, AppErr>;

    fn wrap_with_msg(self, msg: &'static str) -> Result<T, AppErr>;
}

impl<T> OptionWrap<T> for Option<T> {
    fn wrap(self) -> Result<T, AppErr> {
        match self {
            Some(v) => Ok(v),
            None => Err(AppErr::Wrap(Cow::Borrowed("option none"))),
        }
    }

    fn wrap_with_msg(self, msg: &'static str) -> Result<T, AppErr> {
        match self {
            Some(v) => Ok(v),
            None => Err(AppErr::Wrap(Cow::Borrowed(msg))),
        }
    }
}
