import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import Swal from "sweetalert2";
import { useSaleRegister } from "./useSaleRegister";

// Mock de SweetAlert2
vi.mock("sweetalert2", () => ({
    default: {
        fire: vi.fn(() => Promise.resolve()),
        getContainer: vi.fn(() => ({
            style: {},
        })),
    },
}));

describe("useSaleRegister", () => {
    let registerSaleMock;

    beforeEach(() => {
        registerSaleMock = vi.fn(() => Promise.resolve());
        vi.clearAllMocks();
    });

    it("registra la venta llamando al servicio", async () => {
        const { result } = renderHook(() =>
            useSaleRegister({ registerSale: registerSaleMock })
        );

        await act(async () => {
            await result.current.register([{ id: 1 }]);
        });

        expect(registerSaleMock).toHaveBeenCalledTimes(1);
        expect(registerSaleMock).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it("muestra la alerta de éxito con SweetAlert", async () => {
        const { result } = renderHook(() =>
            useSaleRegister({ registerSale: registerSaleMock })
        );

        await act(async () => {
            await result.current.register([{ id: 123 }]);
        });

        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Venta registrada con éxito",
                icon: "success",
                timer: 1200,
                showConfirmButton: false,
            })
        );
    });

    

    it("retorna true cuando el registro es exitoso", async () => {
        const { result } = renderHook(() =>
            useSaleRegister({ registerSale: registerSaleMock })
        );

        let response;
        await act(async () => {
            response = await result.current.register([{ id: 9 }]);
        });

        expect(response).toBe(true);
    });
});
