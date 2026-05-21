# ts-lib

`ts-lib` 是 ESM-only 源码库。使用者直接按子路径导入所需模块：

```ts
import { createHttp } from "ts-lib/http";
import { isError, tryResult } from "ts-lib/result";
```

## result 模块

`tryResult(target)` 把同步函数, Promise 或 async 函数包装为 `Result<T>`:

- 成功: `T`
- 失败: `Error`

导出面:

- `type Result<T>`
- `tryResult(target)`
- `isError(value)`

失败固定为 `Error`; `tryResult` 捕获到的非 `Error` 失败值会转为 `Error`。返回, resolve, throw 或 reject 出来的 `Error` 会原样作为失败返回。

可调用对象会优先按 thunk 执行; 如果需要包装 callable thenable, 放进回调里返回。
