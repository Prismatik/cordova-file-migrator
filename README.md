# File migrator

This module handles migrating files around if a new version of your app expects them to be in a different place.

```migrator.migrateIfNecessary(from, to, callback)```

from and to are both required paths. Despite what the Cordova File plugin docs say, to must not already exist. If it does, you'll get an error code 9. Yay.

callback is not optional

You can optionally pass in a FileSystem object when instantiating the module. If you do, the module will store it's migrated flag in the root of that fs. If you don't, the module will request it's own, which will be Library.
