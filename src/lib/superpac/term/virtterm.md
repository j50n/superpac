# VirtTerm

## Data Design

Data for the virtual terminal is designed to support creating a terminal with no
object creation needed. Color objects are singletons except in the case of
24-bit color, where the caller has the opportunity to manage interning colors.
The character array, where each character is a `Uint8Array`, can also be
interned.

Note that the caller has the option not to intern colors and characters, and the
only penalty is additional garbage collection overhead. For animation purposes,
the caller should make every effort to use interned objects where possible.
