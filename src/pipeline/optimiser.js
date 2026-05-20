"use strict";

export function optimiser(A, B, compare) {

    if (!A || !B || !compare) {
        return null;
    }

    const wave =
        compare?.core?.wave;

    if ((wave?.pct ?? 0) < 0) {

        return {
            recommendation:
                "Improve survivability scaling (defensive setup lagging)"
        };
    }

    return {
        recommendation:
            "Current build is balanced"
    };
}