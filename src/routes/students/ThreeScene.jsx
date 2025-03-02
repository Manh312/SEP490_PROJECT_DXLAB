import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1000 / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(1000, 600);
    mountRef.current.appendChild(renderer.domElement);

    // Ánh sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Sàn với màu gỗ hiện đại
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xd3b899 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Tường bao quanh
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, transparent: true, opacity: 0.8 });
    const walls = [
      new THREE.Mesh(new THREE.BoxGeometry(20, 5, 0.2), wallMaterial), // Tường trước
      new THREE.Mesh(new THREE.BoxGeometry(20, 5, 0.2), wallMaterial), // Tường sau
      new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 20), wallMaterial), // Tường trái
      new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 20), wallMaterial), // Tường phải
    ];
    walls[0].position.set(0, 2.5, -10);
    walls[1].position.set(0, 2.5, 10);
    walls[2].position.set(-10, 2.5, 0);
    walls[3].position.set(10, 2.5, 0);
    scene.add(...walls);



    const addTableWithChairs = (x, z, chairCount) => {
      const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });

     // Xoay bàn theo chiều dọc
     const table = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 3), tableMaterial);
     table.position.set(x, 1, z);
     scene.add(table);

     // Chân bàn
     const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
     for (let i = -0.75; i <= 0.75; i += 1.5) {
       for (let j = -1.4; j <= 1.4; j += 2.8) {
         const leg = new THREE.Mesh(legGeometry, tableMaterial);
         leg.position.set(x + i, 0.5, z + j);
         scene.add(leg);
       }
     }

      // Ghế văn phòng chuyên nghiệp
      for (let i = 0; i < chairCount; i++) {
        const angle = (i * (2 * Math.PI)) / chairCount;
        const chairX = x + Math.cos(angle) * 2;
        const chairZ = z + Math.sin(angle) * 2;

        // Chân ghế
        const chairLegMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const legPositions = [
          [-0.3, -0.3],
          [-0.3, 0.3],
          [0.3, -0.3],
          [0.3, 0.3],
        ];

        legPositions.forEach(([dx, dz]) => {
          const chairLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16), chairLegMaterial);
          chairLeg.position.set(chairX + dx, 0.25, chairZ + dz);
          scene.add(chairLeg);
        });

        // Tạo mặt ghế
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), chairMaterial);
        seat.position.set(chairX, 0.6, chairZ);
        scene.add(seat);

        // Tạo lưng ghế
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.2), chairMaterial);
        backrest.position.set(chairX, 1.1, chairZ - 0.3);
        scene.add(backrest);
      }
    };

    // Tạo khu vực bàn ghế
    addTableWithChairs(-5, -5, 4);
    addTableWithChairs(5, -5, 6);
    addTableWithChairs(-5, 5, 8);
    addTableWithChairs(5, 5, 6);
    addTableWithChairs(0, 0, 6);

    // Thêm TV
    const tvMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const tv = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 0.1), tvMaterial);
    tv.position.set(0, 2, -9.5);
    scene.add(tv);

    // Thêm bảng hai bên TV
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const leftBoard = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.1), boardMaterial);
    const rightBoard = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.1), boardMaterial);
    leftBoard.position.set(-5, 2, -9.5);
    rightBoard.position.set(5, 2, -9.5);
    scene.add(leftBoard, rightBoard);

    // Cấu hình camera
    camera.position.set(0, 8, 18);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Ẩn tường theo vị trí chuột điều hướng
    const updateWallsVisibility = () => {
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const angleX = Math.atan2(direction.x, direction.z);

      walls[0].visible = !(angleX > -Math.PI / 4 && angleX < Math.PI / 4); // Tường trước
      walls[1].visible = !(angleX < -3 * Math.PI / 4 || angleX > 3 * Math.PI / 4); // Tường sau
      walls[2].visible = !(angleX > Math.PI / 4 && angleX < 3 * Math.PI / 4); // Tường trái
      walls[3].visible = !(angleX > -3 * Math.PI / 4 && angleX < -Math.PI / 4); // Tường phải
    };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      updateWallsVisibility();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="w-[1000px] h-[600px] mx-auto my-5">
      <div ref={mountRef} className="w-full h-full"></div>
    </div>
  );
};

export default ThreeScene;
