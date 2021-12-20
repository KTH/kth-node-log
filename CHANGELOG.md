# Changelog

All notable changes for major version updates will be documented here.

## 4.0.0

The package has been renamed to @kth/log.

The default log level is set to INFO. Previously it was DEBUG.

Serializers for req and res have been added by default. These serializers allow only a small set of fields to be logged to prevent sensitve data from beeing leaked to logs.
