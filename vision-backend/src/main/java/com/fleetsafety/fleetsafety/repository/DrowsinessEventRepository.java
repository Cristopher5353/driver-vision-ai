package com.fleetsafety.fleetsafety.repository;

import com.fleetsafety.fleetsafety.domain.DrowsinessEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DrowsinessEventRepository extends MongoRepository<DrowsinessEvent, String> {
    // Obtener los eventos más recientes ordenados por timestamp descendente
    List<DrowsinessEvent> findTop50ByOrderByTimestampDesc();
    // Buscar por ID de Vehículo ordenados de más reciente a más antiguo
    List<DrowsinessEvent> findByVehicleIdOrderByTimestampDesc(String vehicleId);
}
