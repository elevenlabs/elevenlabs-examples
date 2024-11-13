import {PropsWithChildren} from "react";

export function Code({children}: PropsWithChildren) {
    return <span className={'border rounded border-gray-700 bg-gray-100 text-gray-600 py-0.5 px-1'}>{children}</span>
}